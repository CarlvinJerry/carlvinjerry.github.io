---
title: Simple Moving Average Crossover Strategy in F#
author: Carlvin M Jerry
categories: Quantitative Modelling
image: /images/movingavgs.png
menu:
  sidebar:
    name: Simple Moving Average
    identifier: movingavgs
    parent: quant-finance
hero: /images/movingavgs.jpg
tags: Algorithmic Trading,Quantitative Finance,Time Series Analysis
description: "Learn how to build a Moving Average Crossover trading strategy in F#—a beginner-friendly guide to algorithmic trading. This step-by-step tutorial breaks down the math behind trend-following signals, implements a clean F# pipeline for backtesting, and explains key concepts like window sizing, thresholds, and risk management. Perfect for quant developers exploring functional programming or traders dipping their toes into systematic strategies. Includes ready-to-run code examples and practical extensions to adapt the strategy to real markets."
canonical: "https://blogs.innova.co.ke/moving-averages/"
---

## Basic Components  
If you're new to algorithmic trading, a moving average crossover strategy is one of the simplest and most popular approaches. It works by comparing two averages of an asset's price over different time periods to identify potential buy or sell signals.

## How It Works  
**Short-Term Average**: Calculates the average price over recent days (e.g., 5 days)

**Long-Term Average**: Calculates the average price over a longer period (e.g., 20 days)

**Crossover Signal**: When the short-term average crosses above the long-term average, *it suggests an upward trend (buy signal)*. When it crosses below, *it suggests a downward trend (sell signal)*.

### Breaking Down the F# Implementation
#### 1. The Data Structure
```fsharp
type PriceData = {
    Symbol: string    // The stock or asset (e.g., "AAPL")
    Price: decimal    // The current price (e.g., 150.50)
    Timestamp: DateTime // When this price was recorded
}
```

This simple structure keeps track of all the information we need about each price point.  

#### 2. Strategy Configuration
```fsharp
type StrategyConfig = {
    ShortWindow: int   // How many days for the short average (e.g., 5)
    LongWindow: int    // How many days for the long average (e.g., 20)
    Threshold: decimal // How much difference we need to trigger a signal
}
```  
You can adjust these numbers to make the strategy more or less sensitive to price changes.  

#### 3. The Moving Average Calculation
```fsharp
let movingAverage (window: int) (prices: decimal list) =
    if prices.Length < window then None
    else 
        prices
        |> List.take window    // Take the most recent X prices
        |> List.average        // Calculate their average
        |> Some               // Return the result
```

This function:

1. Checks if we have enough data

2. Takes the most recent prices

3. Calculates their average  

#### 4. Detecting Crossovers
```fsharp
let detectCrossover config prices =
    match movingAverage config.ShortWindow prices,
          movingAverage config.LongWindow prices with
    | Some shortMA, Some longMA ->
        if shortMA > longMA + config.Threshold then Some "BUY"
        elif shortMA < longMA - config.Threshold then Some "SELL"
        else None
    | _ -> None
```
This is where the magic happens:

1. We calculate both averages

2. If the short average is significantly above the long average → Buy

3. If the short average is significantly below → Sell

4. Otherwise → No signal

#### 5. Piecing It All Up 
```fsharp
let maCrossoverStrategy config (priceHistory: PriceData list) =
    let prices = priceHistory |> List.map (fun p -> p.Price)
    
    match detectCrossover config prices with
    | Some signal -> 
        let lastPrice = priceHistory.Head
        Some {
            Symbol = lastPrice.Symbol
            Signal = signal
            Price = lastPrice.Price
            Time = lastPrice.Timestamp
        }
    | None -> None
```
Our final function:

1. Extracts just the prices from our history

2. Checks for a crossover signal

3. If found, returns details about the signal

4. If not found, returns nothing

## Application
To use this moving average crossover strategy, you would first collect historical price data for the stock or asset you want to analyze, ensuring you have enough data points to cover your chosen time windows. Next, configure the strategy by selecting appropriate window sizes for your short-term and long-term moving averages (like 5 and 20 days) and setting a threshold that determines how significant the crossover needs to be to trigger a signal.   

Once configured, feed your price history into the strategy to generate potential buy or sell signals based on when the short-term average crosses above or below the long-term average. Finally, you could use these signals to inform your trading decisions, though it's crucial to implement proper risk management techniques like stop-loss orders and position sizing, as this basic strategy doesn't account for all market variables and should be thoroughly tested before use with real capital.   

The F# implementation provides a clear, testable foundation that you can build upon with additional filters and risk controls as you gain experience.  

### Example With Sample Data
```fsharp
// Set up a 5-day vs 20-day strategy with 0.5 threshold
let config = {
    ShortWindow = 5
    LongWindow = 20
    Threshold = 0.5m
}

// Sample Apple stock prices over 5 days
let testData = [
    { Symbol = "AAPL"; Price = 150m; Timestamp = DateTime.Now.AddDays(-4.0) }
    { Symbol = "AAPL"; Price = 151m; Timestamp = DateTime.Now.AddDays(-3.0) }
    { Symbol = "AAPL"; Price = 152m; Timestamp = DateTime.Now.AddDays(-2.0) }
    { Symbol = "AAPL"; Price = 153m; Timestamp = DateTime.Now.AddDays(-1.0) }
    { Symbol = "AAPL"; Price = 154m; Timestamp = DateTime.Now }
]

// Run the strategy
let signal = maCrossoverStrategy config testData
```
In this example, if the prices are consistently rising, we might get a "BUY" signal.