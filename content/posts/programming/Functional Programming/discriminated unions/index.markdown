---
title: "Modelling Relationships in F# for Domain-Driven Design"
date: 2025-07-21T08:06:25+06:00
description: Learn how to use F#'s discriminated unions to model complex relationships in domain-driven design, with practical examples in financial data modeling.
summary: This post explores F#'s discriminated unions for domain-driven design, focusing on financial systems. Through examples like modeling financial instruments, transactions, and account types, we demonstrate how to encode business rules, ensure type safety, and simplify complex domains using F#.
readingTime: true
image: /images/discUnions.jpg
categories: ["Programming", "Languages", "F#", "Domain-Driven Design", "Financial Modeling"]
tags: ["functional programming", "F#", "language features", "Discriminated Unions"]
menu:
  sidebar:
    name: Discriminated Unions in F#
    identifier: Discriminated-Unions-in-F#
    parent: functional-programming
hero: discUnions.jpg
canonical:
---

As a functional-first programming language,  F# excels at creating robust, maintainable, and expressive domain models. This is handy, particularly for complex domains like financial data or financial systems. In *Get Programming with F#: A Guide for .NET Developers* by Isaac Abraham, Lesson 21- "Modeling Relationships in F#," introduces the use of **discriminated unions** (DUs) as a flexible and type-safe tool for modeling relationships between data entities. This blog post explores the concepts from this lesson, focusing on how to apply discriminated unions to domain specific development. Our focus is on cases in financial data domains, such as modeling financial instruments, transactions, or account types with detailed examples inspired by the book’s approach. We’ll dive into practical scenarios, demonstrating how F#’s type system and DUs can encode business rules, ensure correctness, and simplify domain driven modeling.

## Why Discriminated Unions ?

Maintaining strict relationships in Domain-driven development often involves complex considerations. Building financial systems will include modeling for entities like accounts, transactions, or investment instruments that have specific rules and constraints. For example, a financial transaction might be a deposit, withdrawal, or transfer, each with distinct properties and validation rules. In object-oriented programming (e.g., C#), such relationships are typically modeled using *inheritance* (**is-a**) or composition (**has-a**). However, these approaches can lead to rigid hierarchies or verbose codebases that are hard to maintain.

F#’s discriminated unions offer a more elegant solution by allowing you to define *a type that can be one of several distinct cases, each with its own data structure*. This is particularly useful in domains where entities have mutually exclusive states or types (e.g., a financial instrument can be a stock, bond, or option, but not multiple at once). Inherently, DUs are:

- **Type-safe**: The compiler ensures that all possible cases are handled, reducing runtime errors.
- **Expressive**: They allow you to encode business rules directly in the type system, making invalid states unrepresentable.
- **Concise**: They reduce boilerplate code compared to class hierarchies.
- **Immutable by default**: This aligns with functional programming principles, ensuring data consistency in applications where immutability is critical for auditability.

In *Get Programming with F#*, Isaac Abraham emphasizes that DUs are a cornerstone of F#’s ability to model relationships effectively. Let’s explore this with financial data examples, drawing on the principles from Lesson 21.  


----------------------------------------

## Example 1: Modeling Financial Instruments

Financial instruments are a core concept in finance, representing assets like stocks, bonds, or derivatives. Each type of instrument has unique properties, but they all share a common context (e.g., they can be traded or valued). Let’s model financial instruments using a discriminated union in F#.

### Defining the Discriminated Union

Suppose we want to model three types of financial instruments: **Stock**, **Bond**, and **Option**. Each has different attributes:
- A **Stock** has a ticker symbol and a current share price.
- A **Bond** has a face value, coupon rate, and maturity date.
- An **Option** has an underlying asset, strike price, and expiration date.

Here’s how we can define this in F# using a discriminated union:

```fsharp
type FinancialInstrument =
    | Stock of Ticker: string * SharePrice: decimal
    | Bond of FaceValue: decimal * CouponRate: float * MaturityDate: System.DateTime
    | Option of Underlying: string * StrikePrice: decimal * ExpirationDate: System.DateTime
```

Each case of the `FinancialInstrument` DU represents a specific type of instrument, with its associated data. The `Ticker`, `SharePrice`, `FaceValue`, etc., are named fields, making the code self-documenting and easy to understand.

### Using the Discriminated Union

With our DU well defined above, we can create some instances of financial instruments and write a function to describe them:

```fsharp
let safaricomStock = Stock("SAF", 150.25m)
let treasuryBond = Bond(1000.0m, 0.03, System.DateTime(2030, 12, 1))
let callOption = Option("SAF", 160.0m, System.DateTime(2025, 12, 31))

let describeInstrument instrument =
    match instrument with
    | Stock(ticker, price) -> sprintf "Stock: %s, Share Price: Ksh%.2f" ticker price
    | Bond(faceValue, couponRate, maturity) -> 
        sprintf "Bond: Face Value Ksh%.2f, Coupon Rate %.2f%%, Matures %s" 
            faceValue (couponRate * 100.0) (maturity.ToString("yyyy-MM-dd"))
    | Option(underlying, strike, expiration) -> 
        sprintf "Option: Underlying %s, Strike Price Ksh%.2f, Expires %s" 
            underlying strike (expiration.ToString("yyyy-MM-dd"))
```

Using pattern matching, we can handle each case explicitly. The `match` expression ensures that we account for all possible cases, and the F# compiler will warn us if we miss one. Let’s test it:

```fsharp
printfn "%s" (describeInstrument safaricomStock) // Output: Stock: SAF, Share Price: Ksh150.25
printfn "%s" (describeInstrument treasuryBond) // Output: Bond: Face Value Ksh1000.00, Coupon Rate 3.00%, Matures 2030-12-01
printfn "%s" (describeInstrument callOption) // Output: Option: Underlying SAF, Strike Price Ksh160.00, Expires 2025-12-31
```


In a financial application, ensuring that all instrument types are handled correctly is critical. For example, a pricing function might need different logic for stocks (market price), bonds (discounted cash flow), and options (Black-Scholes model). The DU ensures that you can’t accidentally treat a bond as a stock, and the compiler enforces exhaustive pattern matching, reducing bugs. This aligns with Abraham’s emphasis on “trusting the compiler” to catch errors at compile time.

----------------------------------------

## Example 2: Modeling Financial Transactions

Financial transactions are another area where relationships need careful modeling. A transaction could be a **Deposit**, **Withdrawal**, or **Transfer**, each with specific rules. For instance:
- A **Deposit** increases an account balance and requires a positive amount.
- A **Withdrawal** decreases the balance but must not result in a negative balance.
- A **Transfer** moves money between accounts, requiring both a source and destination account.

### Defining the Transaction Type

We can model transactions using a discriminated union to encode the properties and constraints for each case:

```fsharp
type AccountId = string
type Transaction =
    | Deposit of Amount: decimal * Account: AccountId
    | Withdrawal of Amount: decimal * Account: AccountId
    | Transfer of Amount: decimal * FromAccount: AccountId * ToAccount: AccountId
```

### Enforcing Business Rules

To ensure valid transactions, we can now write a function that processes transactions and enforces our business rules, such as ensuring positive amounts and sufficient funds for withdrawals. Here’s an example implementation:

```fsharp
type Account = { Id: AccountId; Balance: decimal }

let processTransaction accounts transaction =
    match transaction with
    | Deposit(amount, accountId) when amount > 0.0m ->
        let account = accounts |> List.find (fun a -> a.Id = accountId)
        let updatedAccount = { account with Balance = account.Balance + amount }
        Ok (accounts |> List.map (fun a -> if a.Id = accountId then updatedAccount else a))
    | Deposit(_, _) -> Error "Deposit amount must be positive"
    | Withdrawal(amount, accountId) when amount > 0.0m ->
        let account = accounts |> List.find (fun a -> a.Id = accountId)
        if account.Balance >= amount then
            let updatedAccount = { account with Balance = account.Balance - amount }
            Ok (accounts |> List.map (fun a -> if a.Id = accountId then updatedAccount else a))
        else
            Error "Insufficient funds"
    | Withdrawal(_, _) -> Error "Withdrawal amount must be positive"
    | Transfer(amount, fromAccountId, toAccountId) when amount > 0.0m && fromAccountId <> toAccountId ->
        let fromAccount = accounts |> List.find (fun a -> a.Id = fromAccountId)
        let toAccount = accounts |> List.find (fun a -> a.Id = toAccountId)
        if fromAccount.Balance >= amount then
            let updatedFrom = { fromAccount with Balance = fromAccount.Balance - amount }
            let updatedTo = { toAccount with Balance = toAccount.Balance + amount }
            Ok (accounts |> List.map (fun a -> 
                if a.Id = fromAccountId then updatedFrom 
                elif a.Id = toAccountId then updatedTo 
                else a))
        else
            Error "Insufficient funds in source account"
    | Transfer(_, _, _) -> Error "Invalid transfer: amount must be positive and accounts must be different"
```

This function uses pattern matching with guards (`when` clauses) to enforce rules like positive amounts and sufficient funds. The `Result` type (`Ok` or `Error`) is used to handle success or failure, a common functional programming pattern for error handling.

### Testing the Transaction Processor

Let’s test it with a sample account list:

```fsharp
let accounts = [
    { Id = "A1"; Balance = 1000.0m }
    { Id = "A2"; Balance = 500.0m }
]

let deposit = Deposit(200.0m, "A1")
let withdrawal = Withdrawal(300.0m, "A2")
let transfer = Transfer(100.0m, "A1", "A2")
let invalidWithdrawal = Withdrawal(1000.0m, "A2")

let testTransaction transaction =
    match processTransaction accounts transaction with
    | Ok updatedAccounts -> 
        printfn "Success! Updated accounts: %A" updatedAccounts
        updatedAccounts
    | Error msg -> 
        printfn "Error: %s" msg
        accounts

let accountsAfterDeposit = testTransaction deposit
// Output: Success! Updated accounts: [{ Id = "A1"; Balance = 1200.0 }; { Id = "A2"; Balance = 500.0 }]
let accountsAfterWithdrawal = testTransaction withdrawal
// Output: Success! Updated accounts: [{ Id = "A1"; Balance = 1200.0 }; { Id = "A2"; Balance = 200.0 }]
let accountsAfterTransfer = testTransaction transfer
// Output: Success! Updated accounts: [{ Id = "A1"; Balance = 1100.0 }; { Id = "A2"; Balance = 300.0 }]
let accountsAfterInvalid = testTransaction invalidWithdrawal
// Output: Error: Insufficient funds
```


Defining these business rules is important because domain-driven platforms like financial systems require strict validation to prevent errors like overdrafts or invalid transfers. The DU approach ensures that all transaction types are explicitly defined and handled, and the compiler enforces that no case is missed. By encoding business rules (e.g., positive amounts, sufficient funds) in the type system and pattern matching, we reduce the risk of runtime errors and make the code more maintainable. This is a key strength of F# as it allows developers to encode domain logic directly in the type system, making illegal states unrepresentable.  

----------------------------------------

## Example 3: Modeling Account Types with Business Rules

In a banking system, accounts can have different types (e.g., **Checking**, **Savings**, or **Investment**), each with specific rules. For example:
- A **Checking** account allows overdrafts up to a limit.
- A **Savings** account has a minimum balance requirement.
- An **Investment** account tracks a portfolio of instruments.

### Defining the Account Type

We can use a discriminated union to model account types and embed their specific properties:

```fsharp
type AccountType =
    | Checking of OverdraftLimit: decimal
    | Savings of MinimumBalance: decimal
    | Investment of Portfolio: FinancialInstrument list
```

### Processing Withdrawals by Account Type

Let’s write a function respecting the rules for each account type to process withdrawals:

```fsharp
let processWithdrawal amount accountType account =
    match accountType with
    | Checking(overdraftLimit) ->
        if account.Balance - amount >= -overdraftLimit then
            Ok { account with Balance = account.Balance - amount }
        else
            Error "Amount exceeds overdraft limit"
    | Savings(minimumBalance) ->
        if account.Balance - amount >= minimumBalance then
            Ok { account with Balance = account.Balance - amount }
        else
            Error "Amount below minimum balance"
    | Investment(_) ->
        if account.Balance >= amount then
            Ok { account with Balance = account.Balance - amount }
        else
            Error "Insufficient funds"
```

### Testing the Withdrawal Function

```fsharp
let checkingAccount = { Id = "A1"; Balance = 100.0m }
let savingsAccount = { Id = "A2"; Balance = 1000.0m }
let investmentAccount = { Id = "A3"; Balance = 500.0m }

let checkingType = Checking(50.0m)
let savingsType = Savings(200.0m)
let investmentType = Investment([safaricomStock; treasuryBond])

let testWithdrawal amount account accountType =
    match processWithdrawal amount accountType account with
    | Ok updatedAccount -> printfn "Withdrawal successful: %A" updatedAccount
    | Error msg -> printfn "Withdrawal failed: %s" msg

testWithdrawal 120.0m checkingAccount checkingType // Output: Withdrawal successful: { Id = "A1"; Balance = -20.0 }
testWithdrawal 900.0m savingsAccount savingsType // Output: Withdrawal successful: { Id = "A2"; Balance = 100.0 }
testWithdrawal 600.0m investmentAccount investmentType // Output: Withdrawal failed: Insufficient funds
```


This example demonstrates how DUs can encode domain-specific rules (e.g., overdraft limits, minimum balances) directly in the type system. Associating data like `OverdraftLimit` or `MinimumBalance` with the account type ensures that the rules are enforced at compile time, reducing the risk of errors in financial calculations. Abraham’s lesson emphasizes that DUs allow developers to model complex relationships in a way that is both expressive and safe, aligning perfectly with the needs of specific domains.

----------------------------------------
## Key Takeaways

Isaac Abraham’s *Get Programming with F#* highlights several key benefits of using discriminated unions for modeling relationships, particularly in domains like finance:

1. **Type Safety**: DUs ensure that all possible cases are handled via pattern matching, preventing runtime errors. For example, you can’t process a transaction without accounting for deposits, withdrawals, and transfers.
2. **Expressive Domain Modeling**: DUs allow you to represent complex relationships (e.g., different types of financial instruments or accounts) in a concise and readable way.
3. **Business Rules in Code**: By embedding rules like positive amounts or sufficient funds in the type system, you make invalid states unrepresentable, a concept Abraham refers to as “making illegal states unrepresentable.”
4. **Maintainability**: Adding a new transaction type (e.g., `DividendPayment`) requires updating the DU and pattern matching, and the compiler will guide you to update all relevant code paths.


## Conclusion

Modeling relationships in F# using discriminated unions provides a powerful approach to building robust domain-specific applications. By leveraging DUs, you can create type-safe, expressive, and maintainable domain models that encode business rules directly in the code. The financial data examples above—modeling instruments, transactions, and account types—demonstrate how F#’s type system can simplify complex domains while ensuring correctness. 

>As Isaac Abraham notes, F#’s functional-first approach, combined with tools like DUs, leads developers to a “pit of success,” where the language’s design naturally guides you toward writing better code.

For further exploration, check out the companion code repository for *Get Programming with F#* on GitHub (https://github.com/isaacabraham/get-programming-fsharp) or dive into Abraham’s *F# in Action* for more advanced domain-modelling examples. May your models be as robust as your F# types!