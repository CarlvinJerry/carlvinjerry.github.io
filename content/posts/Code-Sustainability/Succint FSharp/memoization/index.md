---
title: "Memoization with Fibonacci"
author: Carlvin Jerry
date: 2024-11-04T21:37:25+06:00
description: A Guide to Optimized Functional Programming with Memoization in F#
canonical: "https://blogs.innova.co.ke/memoization/"
image: /images/memory.jpg
menu:
  sidebar:
    name: Memoization in F# 
    identifier: memoization-in-fsharp
    parent: Succint-FSharp
hero: memory.jpg
tags:
  - F#
  - Optimization
  - Functional Programming
  - Caching
  - Software Development
useMath: true
---

 **Memoization**, commonly known as caching is a key technique we can use for performance optimization in programming. Memoization simply stores the results from a previous computation for later retrieval whenever the arguments are presented again. The ability to re-use these, often expensive functions, brings significant performance improvements - especially in scenarios with repetitive computations. In F#, memoization is not only a helpful optimization but also a natural fit due to the language’s ***immutable*** data structures and functional nature. In this post, we’ll take a deep dive into memoization, its benefits, and how to implement it in F#.
 

#### Why Memoization Matters
In memoization,the results of function calls are stored in a lookup table or dictionary so that repeated calls with the same inputs can be served directly from the cache. This technique is particularly beneficial in situations where:

* The function is called multiple times with the same input values.
* The function performs computationally expensive operations.
* The results of the function calls are deterministic i.e, they consistently return the same output for the same input.

Technically, memoization is useful in various applications: 

* **Recursive Algorithms**: Recursive functions like the Fibonacci sequence or factorial calculations benefit from memoization since they frequently recalculate the same values.
* **Dynamic Programming**: Memoization helps to optimize many dynamic programming problems, where subproblems overlap.
* **Data Processing**: Data pipelines with functions that process complex datasets can benefit from memoization to avoid redundant calculations.

### Basic Memoization in F#
In F#, we can create memoized functions using higher-order functions and immutable collections. In the code below, we start by implementing a simple memoization function that uses a dictionary to store computed results. This dictionary serves as our cache, holding key-value pairs where the keys are function inputs and the values are computed outputs:  

```fsharp
let memoize f =
    let cache = System.Collections.Generic.Dictionary<_, _>()
    fun x ->
        if cache.ContainsKey(x) then
            cache.[x]
        else
            let result = f x
            cache.[x] <- result
            result
```  

In the function above, we first take an input function f and return a new function that checks if a result is already cached. If the result is in the cache, it is returned immediately. Else, the function computes the result, stores it in the cache  and then returns it.

### Advanced Memoization with Higher-Order Functions
While the basic `memoize` function above works for single-argument functions, many real-world functions take multiple arguments. In F#, we can extend our `memoization` technique to handle multiple parameters using tuples as dictionary keys.

Here’s how we can create a memoized function that handles multiple arguments:

```fsharp
let memoizeMultiArgs f =
    let cache = System.Collections.Generic.Dictionary<_, _>()
    fun x y ->
        let key = (x, y)
        if cache.ContainsKey(key) then
            cache.[key]
        else
            let result = f x y
            cache.[key] <- result
            result
```




#### Example: Memoizing a Multi-Argument Function
Consider a function `power`, that computes x raised to the power of y. Memoizing this function can help reduce redundant computations when the same arguments are encountered multiple times:  

```fsharp
let power x y = pown x y

let memoizedPower = memoizeMultiArgs power
```  

The `memoizeMultiArgs` function creates a composite key from the arguments (x, y), allowing the cache to store results for each unique pair. When the same (x, y) pair is passed again, the function immediately returns the cached result, avoiding the need for recalculating the power.  

### Implementing Memoization with Immutable Data Structures
F#’s immutable data structures encourage developers to write ***side-effect-free functions***, which are ideal for memoization. By eliminating side effects, we ensure that the cached results are predictable and stable over the lifetime of the program.

If you prefer not to use mutable dictionaries, you can implement memoization with an immutable map (e.g., `Map` in F#). The caveat with using immutable structures means that each time a new value is added to the cache, a new map is created. This can impact performance for larger datasets. For most applications, the mutable dictionary approach is more efficient.  

### Memoization with Lazy Evaluation in F#
Memoization and lazy evaluation are complementary techniques that work well together. Lazy evaluation defers computation until the result is needed, while memoization ensures that repeated calls with the same arguments are cached.

In F#, we can combine lazy evaluation with memoization by wrapping values in the `lazy` keyword:  

```fsharp
let memoizeLazy f =
    let cache = System.Collections.Generic.Dictionary<_, Lazy<_>>()
    fun x ->
        match cache.TryGetValue(x) with
        | true, lazyResult -> lazyResult.Value
        | _ ->
            let lazyResult = lazy (f x)
            cache.[x] <- lazyResult
            lazyResult.Value
```  

This function memoizes `f` in a lazy way - only evaluating and caching the result when `lazyResult.Value` is called for the first time. This can be particularly helpful in applications where computations are costly, but some cached values may never actually be used.  

### Memoization in Functional Pipelines
In F#, we often compose functions into pipelines to handle complex data transformations. Memoization can help optimize these pipelines by storing intermediate results.

```fsharp
let memoizePipeline f =
    let cache = System.Collections.Generic.Dictionary<_, _>()
    fun x ->
        if cache.ContainsKey(x) then
            cache.[x]
        else
            let result = f x
            cache.[x] <- result
            result

let expensiveTransformation x = 
    // Imagine some complex computation here
    x * x + 42

let memoizedTransformation = memoizePipeline expensiveTransformation

let results = [1..10] |> List.map memoizedTransformation
```

 `expensiveTransformation`  here is wrapped in a memoized function to ensure the transformation is only calculated once for each unique input in the pipeline. This approach can be scaled to handle multiple transformations or can be applied selectively to certain stages within the pipeline.  
 
### Memoization in Dynamic Programming: Solving the Knapsack Problem
Dynamic programming involves solving complex problems by breaking them down into smaller overlapping subproblems. This makes it a good use-case for momoization. Consider the classic **Knapsack problem**, where we have to maximize the value of items that fit into a bag with a fixed capacity. Memoization allows us to avoid recalculating values for subproblems that have already been solved as illustrated below:  

```fsharp
let knapsack (items: (int * int) list) capacity =
    let rec ks n cap =
        if n = 0 || cap = 0 then 0
        else
            let (weight, value) = items.[n - 1]
            if weight > cap then ks (n - 1) cap
            else max (ks (n - 1) cap) (value + ks (n - 1) (cap - weight))
    memoizeMultiArg ks (List.length items) capacity
```  

In this example, `ks` is the recursive function for calculating the maximum knapsack value. By memoizing the recursive calls, we eliminate redundant calculations, which improves efficiency significantly.  

> With memoization, you can create functions that perform better while maintaining immutability and referential transparency - hallmarks of functional programming. 

With a good understanding of memoization, let's look at another real world example in solving the Fibonacci sequence. 

<br> 

### The Fibonacci Sequence 

Akin to factorials, we can easily use a **Fibonacci sequence** to better illustrate memoization. The Fibonacci sequence starts with two 1’s, and each subsequent number is the sum of the two preceding numbers:  

1,1,2,3,5,8,13,...  

In mathematical terms, it’s written as:  

***F<sub>n</sub> = F<sub>n-1</sub> + F<sub>n-2</sub>***  

Which can also be written recursively as:  

***F<sub>n</sub> = F<sub>n-1</sub> + F<sub>n+2</sub>**    
**F<sub>0</sub> = 0**  
**F<sub>1</sub> = 1**  
**F<sub>n</sub> = F<sub>n</sub> - 1 + F<sub>n</sub> - 2, if n > 1**  
**F<sub>n</sub> = F<sub>n</sub> + 2 - F<sub>n</sub> -1 , if n > 0***  



Starting with 𝐹<sub>(1)</sub>=1 and F<sub>(2)</sub>=1, the sequence builds itself naturally as 1, 1, 2, 3, 5, 8, and so on. Computing Fibonacci numbers recursively without optimization is however inefficient, since each recursive call redundantly recalculates already-known values. Memoization can significantly reduce computation time by storing results of previous calls in a cache, reusing these values as needed.  

Let’s start with the most straightforward implementation of Fibonacci in F# using recursion:  

```fsharp
let rec fibonacci n =
    if n <= 2 then 1
    else fibonacci (n - 1) + fibonacci (n - 2)
```  
This approach above appears intuitive but is not optimized. Each call to `fibonacci` results in two additional calls until we reach the base cases. As `n` tends towards infinity, this redundancy leads to **exponential time complexity**, where the same values are recalculated many times. If we were to call `fibonacci 50`, it would take considerable time due to repeated calculations.

#### Optimizing with Tail Recursion
Tail recursion is a common functional programming technique that allows functions to call themselves recursively without increasing the call stack. We can therefore avoid the stack overflow that a basic recursive function would cause on large inputs by passing the accumulated result along with each recursive call. Here’s an F# implementation of a tail-recursive Fibonacci function:  

```fsharp
let fibonacci_TailRecursive n =
    let rec fibonacciX (n, x, y) =
        if n = 0 then x
        else fibonacciX (n - 1, y, x + y)
    fibonacciX (n, 0, 1)
```  


In the improved version: 
* `fibonacciX` is our **inner recursive** function.
* `x` and `y` represent two consecutive Fibonacci numbers in the sequence.
* Each recursive call reduces `n` by `1`, adding the current and previous results together `(x + y)` until `n` reaches zero.  

This is a more efficient implementation that won’t cause a stack overflow, but it can still be improved in terms of performance by leveraging memoization.  

#### Memoization: Reducing Redundant Computation
As in our initial code, we can implement memoization by creating a cache using a dictionary. This dictionary will store computed Fibonacci values and allow us to return cached results for repeated inputs instantly.

Using a dictionary for our cache, we can rewrite the Fibonacci function with memoization as follows:  

```fsharp
open System.Collections.Generic

let fibonacci_Memoized =
    let cache = Dictionary<_, _>()
    let rec fibonacciX = function
        | n when n = 0I -> 0I
        | n when n = 1I -> 1I
        | n ->
            if cache.ContainsKey(n) then cache.[n]
            else
                let result = fibonacciX (n - 1I) + fibonacciX (n - 2I)
                cache.[n] <- result
                result
    fibonacciX
```

In this function:

* We use `BigInteger` (`n = 0I` and `1I`), which allows us to work with much larger numbers than standard integers. This is useful for deep recursion in the Fibonacci sequence.
* `cache` stores previously computed Fibonacci numbers. The dictionary’s syntax, `cache.[n]`, is the F# equivalent of accessing elements with `cache[n]` in languages like C# or Java.
* When `fibonacciX` is called with a value of `n`, it first checks if `n` is in the cache. If it is, the cached result is returned immediately, skipping further computation.If not, the function recursively computes the value, adds it to the cache, and then returns it.  

In F#’s interactive window (FSI), we can evaluate the function’s performance by using the `#time` directive to record the execution time of any code following it until `#time` is called again. For example, we can test out function above as:  
```fsharp
#time
fibonacci_Memoized 20I
#time
```  

### Benefits and Limitations of Memoization
Memoization isn’t a one-size-fits-all solution. Its key advantages include:

* **Reduced Time Complexity** where functions can avoid exponential time growth and execute in linear time for overlapping subproblems by storing previous computations for re-use.
* **Improved Efficiency**: Repeated inputs result in constant-time lookups in the cache, providing significant speedup.
* **Scalability for Recursion**: Memoization helps avoid stack overflow issues, particularly when combined with tail recursion for complex recursive functions.

That being said, there are a few trade-offs:

* **Increased Memory Usage**: Caching comes at the cost of additional memory. For very large inputs, the cache can consume a significant amount of memory.
* **Not Always Suitable**: Memoization is ideal for deterministic functions where inputs consistently map to the same outputs. It’s less effective (or entirely unsuitable) for non-deterministic functions or those with many unique inputs that don’t repeat.  


### Exploring Other Optimization techniques in F#
Memoization is just one of many optimizations in F#. Other techniques such **continuations** and **higher-order functions** can also improve performance and readability in functional code. The ultimate solution involves combining these techniques to yield optimal results, though there’s no universal rule for selecting the best approach. Here are some points to consider when deciding on an optimization technique:

* **Data Variability**: For highly variable data where inputs rarely repeat, memoization may not be as useful.
* **Memory Constraints**: If your program has limited memory availability, consider optimizing your cache size or limiting the range of cached results.
* **Clarity vs. Performance**: Memoization can make code less readable, especially in complex functions. It's important to always weigh clarity against performance requirements especially if the function is a core part of your application.    


<br>
<br>  

In conclusion, Memoization is a valuable optimization technique for recursive problems like the Fibonacci sequence. By caching computed results memoization helps reduce redundant computations, improve execution time, and enable functions to handle larger inputs faster. In F#, memoization aligns well with the language’s functional programming paradigm and can be paired with other optimizations like **tail recursion** to further enhance performance.

