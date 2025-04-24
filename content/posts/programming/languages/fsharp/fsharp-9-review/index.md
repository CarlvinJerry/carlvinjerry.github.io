---
title: "What’s New in F# 9 for Quant Developers"
date: 2025-04-23T19:51:10+03:00
description: "F# 9 introduces powerful language features—such as improved type inference, enhanced pattern matching, anonymous record updates, and custom equality for structs—that streamline quantitative workflows and reduce code complexity in financial modeling and data processing."
readingTime: true
image: /images/fsharp.png
categories: ["Programming", "Languages", "F#"]
tags: ["functional programming", "F#", "language features"]
menu:
  sidebar:
    name: fsharp-9-review
    identifier: fsharp-9-review
    parent: fsharp
hero: fsharp.png
mermaid: true
---

  
Unlike general-purpose updates, many of F# 9's features are particularly well-aligned with the needs of quantitative professionals—those who balance mathematical modeling, financial computation, and high-integrity codebases. These improvements refine the language’s functional core while addressing practical challenges faced in real-world applications, such as code readability, workflow modularity, and precision in data modeling.

In this post, I’ll walk through some of the key updates in F# 9 and explore how they can improve the way we write and structure quantitative code. Each feature will be paired with a real-world use case, drawn from scenarios that are familiar to quantitative researchers, analysts, and developers working across trading systems, risk engines, and research pipelines.

---

## 1. Record Struct Enhancements with Custom Equality

### What’s New
F# 9 introduces enhancements to record structs, allowing developers to define custom equality and comparison behavior with fine-grained control. We can apply the `[<StructuralEquality>]` and `[<StructuralComparison>]` attributes to a struct record and F# generates the necessary methods for **value-based** comparison. This is a powerful tool in performance-critical domains where immutable value types are commonly used and semantic equality matters.

In traditional object-oriented models, equality often defaults to reference equality-two objects are only equal if they reference the same memory location. But in quantitative development, we frequently work with value objects: entities such as **bonds, trades, or market data snapshots** that should be considered equal based on their contents, not their identity. Ensuring these objects compare by value-especially when represented as lightweight structs-helps maintain both correctness and efficiency.

This approach not only reduces boilerplate associated with manual equality implementations but also ensures that collections like Set or Map behave correctly and efficiently.

By declaring a record struct with `[<Struct; StructuralEquality; StructuralComparison>]`, we get value-based comparison out of the box.

### Practical Use Case: Deduplicating Bond Instruments
Consider a scenario where you're ingesting bond data from multiple sources. The bonds may be reported in different orders or formats, but semantically they represent the same instrument. Value-based comparison allows you to identify and eliminate duplicates cleanly.

```fsharp
[<Struct; StructuralEquality; StructuralComparison>]
type Bond = {
    Issuer: string
    Maturity: int // in years
    Coupon: float
}

let bonds = [
    { Issuer = "ABC Corp"; Maturity = 5; Coupon = 0.05 }
    { Issuer = "XYZ Ltd"; Maturity = 5; Coupon = 0.05 }
    { Issuer = "ABC Corp"; Maturity = 5; Coupon = 0.05 }
]

let uniqueBonds = bonds |> Set.ofList
printfn "Unique bonds count: %d" (Set.count uniqueBonds)
```
<br> 

**Why It Matters** 

The resulting set will contain only two unique bonds, as the first and third entries are structurally equal. This feature is especially beneficial in:  


* Data ingestion pipelines, where redundancy is common
* Caching strategies, where identifying equivalent inputs is crucial
* Simulation frameworks, where deterministic comparison affects state tracking  

F# 9 bridges a crucial gap between semantic accuracy and runtime efficiency by allowing struct-based records to participate in equality and comparison operations without losing their value-type performance characteristics.

---

## 2. Improved Type Inference for Lambdas and Partial Application

F# 9 brings significant improvements to type inference, particularly in cases involving nested lambdas, higher-order functions, and **partial application**. These enhancements enable the compiler to infer types more accurately and with less developer intervention, even in deeply functional constructs or when types are only partially specified.

This is especially valuable in quantitative domains, where functions often represent transformations over time series, pricing flows, or recursive structures. Instead of cluttering code with explicit type annotations, developers can now write code that remains both **mathematically expressive and semantically precise-**closely resembling the original analytical formulas.

These refinements also improve the developer experience when composing pipelines or working with APIs like `List.map`, `Array.fold`, or **custom monadic workflows**. Fewer type annotations mean less friction during refactoring, and better inference means fewer surprises when types change upstream.

### Practical Use Case: NPV Calculation  
In financial modeling, **net present value (NPV)** is a common calculation where cash flows are discounted to their present value using a given discount rate. With F# 9, we can define such a function succinctly and safely, trusting the compiler to infer the types.

```fsharp
let calculateNPV discountRate =
    List.sumBy (fun (year, cf) -> cf / ((1.0 + discountRate) ** float year))

let cashflows = [ (1, 100.0); (2, 105.0); (3, 110.0) ]
let npv = calculateNPV 0.05 cashflows
printfn "NPV: %.2f" npv
```

F# 9 infers the types involved in the lambda correctly, so we can write clear and functional code that resembles the mathematics behind it.

<br> 

 **Why It Matters**  
* The lambda inside `List.sumBy` operates on a tuple of `(int * float)` - a common structure for time-indexed financial data.

* The compiler automatically infers the function signature as `float -> (int * float) list -> float`, reflecting a partially applied function returning a curried form.

* There’s no need to annotate the types of `year` or `cf`; F# deduces their roles based on the mathematical operations applied.    

**Broader Impact**  
In large-scale quantitative systems, this improvement translates to:

* **Cleaner domain logic** with fewer distractions from type annotations

* **More reusable higher-order functions** that work naturally with pipelines

* **Faster prototyping** in research and model calibration environments

These type inference improvements lower the cognitive load when building complex functional systems - this allows quantitative developers to focus more on what they’re modeling than on how to coerce the compiler into understanding it.

---

## 3. Anonymous Record Field Copying and Nesting

Anonymous records are lightweight and immutable data containers. In F# 9, you can now create new anonymous records by copying fields from another while modifying specific fields. This allows developers to construct new anonymous records by reusing existing ones and modifying only the fields that change. The syntax is concise and preserves immutability, while making **data transformations more ergonomic** - especially when working with configuration-heavy models.  

In earlier versions of F#, anonymous records were immutable and lightweight, but lacked a way to conveniently modify existing values. Now, with the `with` keyword, you can efficiently perform **partial updates** without reconstructing the entire record manually. Nesting is also supported, making it possible to model **hierarchical data structures** inline.

This is perfect for scenario analysis, where you want to base a stressed model on a baseline by tweaking a few parameters.  


### Practical Use Case: Stress Testing Volatility Assumptions  
Suppose you're building a model that uses a set of baseline assumptions for volatility and interest rates. You want to create a stressed scenario with higher volatility while leaving other parameters unchanged.

```fsharp
let baseParams = {| volatility = 0.2; rate = 0.05 |}
let stressedParams = {| baseParams with volatility = 0.3 |}

printfn "Base vol: %f, Stressed vol: %f" baseParams.volatility stressedParams.volatility
```

<br>

* The `with` keyword lets us **preserve all unchanged fields**, significantly reducing boilerplate and error-prone duplication.

* Anonymous records are **type-safe**, **immutable**, and **structurally typed** .They behave predictably and efficiently in functional workflows.


This avoids verbose copying or reconstruction of data, making configuration updates much cleaner and aligned with immutable best practices.  

---

## 4. Interop Improvements with C# and .NET

One challenge in F# development within .NET-heavy ecosystems is smooth interoperation with C# codebases. F# 9 improves this by enabling better handling of C# features such as nullable reference types and records.

This means F# can more naturally handle APIs or libraries written in C#, which is often the case in financial applications using .NET-based market data vendors or risk engines.

### Example

```fsharp
open System

let getYield (maybeYield: Nullable<float>) =
    match maybeYield.HasValue with
    | true -> maybeYield.Value
    | false -> 0.0
```

This small example illustrates handling `Nullable<T>` from .NET, which is ubiquitous in interop scenarios. Prior to F# 9, this would require more ceremony or workaround.

---

## 5. Enhanced Pattern Matching

Pattern matching is one of F#’s most powerful features. F# 9 continues to improve it by allowing more expressive forms of decomposition and supporting complex patterns in a cleaner syntax.

### Example: Describing Trades

Imagine you’re dealing with a stream of trade data coming from different desks. You need to identify the asset class and extract key information for logging, analytics, or downstream processing:


```fsharp
type Trade =
    | BondTrade of string * float
    | EquityTrade of string * int

let describe trade =
    match trade with
    | BondTrade (issuer, price) -> sprintf "Bond: %s at %.2f" issuer price
    | EquityTrade (ticker, qty) -> sprintf "Equity: %s x %d" ticker qty

let trades = [ BondTrade("CorpA", 102.5); EquityTrade("EQX", 1000) ]
trades |> List.iter (describe >> printfn "%s")
```

This kind of match expression is now easier to write and read, especially as discriminated unions grow more complex.

---

## Final Thoughts

F# 9 may not be a massive paradigm shift, but its incremental improvements add up to meaningful productivity gains that come in handy in quantitative domains where performance, clarity, and expressiveness matter. These updates reinforce F#'s place as a first-class language for modern analytical and data-driven systems.

### Bibliography
Ivanek, Jindra. F# Tips Weekly #6: Structural Equality and Comparison. Hashnode, 2022. https://jindraivanek.hashnode.dev/f-tips-weekly-6-structural-equality-and-comparison.

Pusz, Scott Wlaschin. Partial Application in F#. F# for Fun and Profit, 2012. https://fsharpforfunandprofit.com/posts/partial-application.

Bytes, Jeremy. Diving into F#: Partial Application and Type Inference. JeremyBytes.com, 2016. https://jeremybytes.blogspot.com/2016/07/diving-into-f-partial-application-and.html.

Microsoft. Copy and Update Record Expressions (F#). Microsoft Learn, 2023. https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/copy-and-update-record-expressions.

Microsoft. Anonymous Records (F#). Microsoft Learn, 2023. https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/anonymous-records.


Microsoft. What's New in F# 9. Microsoft Learn, 2023. https://learn.microsoft.com/en-us/dotnet/fsharp/whats-new/fsharp-9.