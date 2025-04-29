---
title: "Currying and Partial Application in F#"
description: A deep dive into currying and partial application in F# with examples and use cases in functional programming.
date: 2024-10-07T08:06:25+06:00
canonical: https://www.innova.co.ke/currying-and-partial-application/
hero: partial.jpg 
image: /images/partial.jpg
menu:
  sidebar:
    name: Currying and Partial Application
    identifier: Currying and Partial Application
    parent: Succint-FSharp
    weight: 10
tags: ["F#", "Functions", "Code Sustainability"]
categories: ["Code Sustainability"]
---


 The mathematical definition of a function can be denoted as a relationship between a set of inputs (the domain) and a single output (the co-domain). When a mathematical function is said to have only one parameter, it typically means that it takes a single value as input. However, in functional programming we build functions that theoretically "defy" this concept by taking in multiple input parameters.
 
Traditionally, a mathematical function may only accept one input at a time. F# however handles the case above by leveraging **currying** and **partial** application to enable functions to appear to take multiple parameters. This enhances flexibility and promotes a functional programming style that emphasizes re-usability and composability. While they are often discussed together, they serve distinct purposes almost in a complementary manner. We illustrate these two concepts and their application below.  

<br> 

### What is Currying?

Currying is a technique that transforms a function that takes multiple arguments into a sequence of smaller/separate functions, each taking a single argument. Put simply, Currying allows you to call a function with fewer arguments than it expects, returning a new function that takes the remaining arguments.

#### Example of Currying in F#
Let’s define a curried function in F#. Consider a basic function that takes two integers and adds them together:

```fsharp
let add x y = x + y
```
Running 
```fsharp
let result = add 2 2;
```
produces **4** as the result...  

We can curry this function by defining it to take one parameter and return a function that takes the second parameter:  

```fsharp
let curriedAdd x =
    fun y -> x + y
```
then call it...

```fsharp
let addSeven = curriedAdd 2
let result = addSeven 7  // result is 9
```
In this example, `curriedAdd` is a function that returns another function. The first call provides 2, and the second call provides 7.


#### Currying with Higher-Order Functions
This approach becomes particularly powerful when combined with higher-order functions. Consider a more complex scenario where we work with a list of integers and apply a series of operations. Suppose we want to filter and map a list based on certain criteria. Here’s how you could define a curried function to achieve this:

```fsharp
let filterAndMap predicate transform =
    fun xs ->
        xs |> List.filter predicate |> List.map transform

let isEven x = x % 2 = 0
let square x = x * x

let processNumbers = filterAndMap isEven square
let numbers = [1; 2; 3; 4; 5; 6]

let result = processNumbers numbers  // result is [4; 16; 36]
```

In this example, `filterAndMap` takes two functions (`predicate` and `transform`) then returns a new function that takes a list of integers. From this, We can easily create a specialized function `processNumbers` to filter even numbers and square them.

### What is Partial Application?
Partial application applies currying by fixing a number of arguments to a function, producing another function of smaller arity. It allows us to create a new function by pre-filling some of the arguments of an existing function. 

We can partially apply the `add` function,revisiting the addition case above:
```fsharp
let add x y = x + y
let addTwo = add 2  // Partial application
let result = addTwo 3  // result is 5
```
In this case, `addTwo` is a new function that adds 2 to any number provided.

#### Partial Application in a Pipeline
Partial application can simplify our code in more complex scenarios. For example, assume you want to create a logging function that logs messages at different levels (info, warning, error). Instead of repeating the logging mechanism, we can partially apply the `log` function.

```fsharp
let log level message =
    printfn "[%s] %s" level message

let logInfo = log "INFO"
let logWarning = log "WARNING"
let logError = log "ERROR"

logInfo "Application started"     // Output: [INFO] Application started
logWarning "Low disk space"       // Output: [WARNING] Low disk space
logError "Unhandled exception"     // Output: [ERROR] Unhandled exception
```
Here, we partially apply the log function to create specialized logging functions for different log levels. This makes our logging mechanism flexible and easy to use.

### Combining Currying and Partial Application
We can also combine currying and partial application to create more sophisticated functions. For example, let’s create a function to perform arithmetic operations based on a given operator:

```fsharp
let operate op x y =
    match op with
    | "+" -> x + y
    | "-" -> x - y
    | "*" -> x * y
    | "/" -> x / y
    | _ -> failwith "Unknown operation"

let add = operate "+" 
let subtract = operate "-" 

let result1 = add 5 3          // result1 is 8
let result2 = subtract 10 4     // result2 is 6
```
In this example, `operate` is a curried function that takes an operator and two numbers, and we create partial applications for addition and subtraction. This flexibility allows for dynamic operations based on input.

Currying and partial application are fundamental concepts that unlock the expressive power of functional programming in F#. With currying, breaking down functions into single-argument units enables functions to be flexible and composable, promotting a modular approach to code. On the other hand, Partial Application allows us to pre-fill arguments, giving rise to specialized versions of functions without sacrificing reusability. With these techniques, we not only simplify function manipulation but also build more readable, maintainable, and scalable code.

Currying and partial application also encourage thinking in terms of function composition and how you can abstract functionality elegantly. 