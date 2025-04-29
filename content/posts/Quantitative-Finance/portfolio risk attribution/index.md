---
title: "Attributing for Risk in Portfolio Management"
author: Carlvin Jerry
date: 2024-12-02T21:37:25+06:00
description: A Guide to Calculating Risk Contributions in Portfolio Management Using Volatility
canonical: "https://blogs.innova.co.ke/portfolio-risk-attribution.md/"
hero: risk.jpg
image: /images/risk.jpg
menu:
  sidebar:
    name: Portfolio Risk Attribution
    identifier: portfolio-risk-attribution
    parent: quant-finance
tags:
  - Risk
  - Portfolio Managemnt
  - Volatility
useMath: true
---



**Risk contribution** helps quantify how much each asset in a portfolio contributes to its overall risk. However, unlike with portfolio returns, a key aspect of portfolio risk is that its measures —like volatility—  must adhere to certain statistical properties such as **monotonicity**, **sub-additivity**, **homogeneity**, and **translation invariance**. The non-linear nature of these formulae therefore makes it a chellenge to split apart and determine individual contributions of each asset to the overal portfolio risk.  

This post takes a closer look at this challenge, using volatility as our primary measure of risk. We’ll explore a practical method to calculate risk contributions in a manner that’s both coherent and sub-additive. Let’s unpack this concept step by step!



As we defined earlier, risk contribution measures the portion of total portfolio risk attributable to each asset. The formula for the risk contribution of an asset \(i\) is:

$$
RC_i = w_i \cdot \left( \frac{\text{Cov}(r_i, r_p)}{\sigma_p} \right)
$$

Where:
- \(RC_i\): Risk contribution of asset \(i\)
- \(w_i\): Weight of asset \(i\) in the portfolio
- \(\text{Cov}(r_i, r_p)\): Covariance of asset \(i\)'s returns with the portfolio's returns
- \(\sigma_p\): Total portfolio standard deviation

This formula allows portfolio managers to pinpoint the contribution of each asset to overall portfolio risk.

##### Simple case study
Looking at an example with a Three-Asset Portfolio, we’ll calculate risk contributions for a portfolio consisting of **Stock A**, **Stock B**, and **Bond C** as listed below. We'll use dummy data for this study and perform a step-by-step risk contribution analysis:

| Asset    | Weight (\( w_i \)) | Std Dev (\( \sigma \)) | Correlations (A, B, C) |
|----------|---------------------|-----------------------|-------------------------|
| Stock A  | 0.40                | 20%                  | 1.0, 0.3, 0.2          |
| Stock B  | 0.30                | 15%                  | 0.3, 1.0, 0.1          |
| Bond C   | 0.30                | 10%                  | 0.2, 0.1, 1.0          |


---

#### 1. Understanding Covariance Matrix

The covariance matrix expresses how the returns of different assets move in relation to each other. In a portfolio, the covariance matrix helps to understand the relationship between the volatilities (standard deviations) and correlations of the assets. For a portfolio with three assets, the covariance matrix would be a **3x3 matrix** with values representing the covariances between pairs of assets.

The covariance matrix is structured as:

\[
\text{Covariance Matrix} =
\begin{bmatrix}
\text{Cov}(A,A) & \text{Cov}(A,B) & \text{Cov}(A,C) \\
\text{Cov}(B,A) & \text{Cov}(B,B) & \text{Cov}(B,C) \\
\text{Cov}(C,A) & \text{Cov}(C,B) & \text{Cov}(C,C)
\end{bmatrix}
\]

Where:
- \(\text{Cov}(A,A)\) is the variance of Asset A,
- \(\text{Cov}(A,B)\) is the covariance between Asset A and Asset B,
- \(\text{Cov}(A,C)\) is the covariance between Asset A and Asset C, and so on.  

  <br>    
  
##### Covariance Formula

To compute the covariance between two assets \(i\) and \(j\), we can use the formula:

$$
\text{Cov}(r_i, r_j) = \rho_{i,j} \cdot \sigma_i \cdot \sigma_j
$$

Where:
- \(\rho_{i,j}\) is the correlation coefficient between the returns of asset \(i\) and asset \(j\),
- \(\sigma_i\) and \(\sigma_j\) are the standard deviations (volatilities) of assets \(i\) and \(j\).  


 <br>    

##### 1.1 Building the Covariance Matrix

Let's now apply this formula with the data from our example to compute the covariances:  
1. **Cov(A, A) (Variance of Stock A)**:  
   \(\text{Cov}(A,A) = \sigma_A^2 = (20\%)^2 = 0.04\)

2. **Cov(A, B)**:  
   \(\text{Cov}(A,B) = \rho_{A,B} \cdot \sigma_A \cdot \sigma_B = 0.3 \cdot 0.20 \cdot 0.15 = 0.009\)

3. **Cov(A, C)**:  
   \(\text{Cov}(A,C) = \rho_{A,C} \cdot \sigma_A \cdot \sigma_C = 0.2 \cdot 0.20 \cdot 0.10 = 0.004\)

4. **Cov(B, B) (Variance of Stock B)**:  
   \(\text{Cov}(B,B) = \sigma_B^2 = (15\%)^2 = 0.0225\)

5. **Cov(B, C)**:  
   \(\text{Cov}(B,C) = \rho_{B,C} \cdot \sigma_B \cdot \sigma_C = 0.1 \cdot 0.15 \cdot 0.10 = 0.0015\)

6. **Cov(C, C) (Variance of Bond C)**:  
   \(\text{Cov}(C,C) = \sigma_C^2 = (10\%)^2 = 0.01\)  

<br> 

##### Constructing the Covariance Matrix

Now that we have the individual covariances, we can construct the covariance matrix:

\[
\text{Covariance Matrix} =
\begin{bmatrix}
0.04 & 0.009 & 0.004 \\
0.009 & 0.0225 & 0.0015 \\
0.004 & 0.0015 & 0.01
\end{bmatrix}
\]

This matrix tells us how the assets in the portfolio move in relation to each other. For example, the covariance between Stock A and Bond C is 0.004, meaning that their returns are somewhat positively correlated, but not as strongly as the correlation between Stock A and Stock B.


---


#### 2. Portfolio Risk (Standard Deviation)

With the covariance matrix in hand, we can now calculate the total portfolio risk (standard deviation). This is done by using the formula:

\[
\sigma_p^2 = w^T \cdot \text{Covariance Matrix} \cdot w
\]

Where:
- \(w\) is the vector of asset weights: \([w_A, w_B, w_C]\),
- \(w^T\) is the transpose of the weight vector.

After performing the matrix multiplication, we find that the total portfolio risk (\(\sigma_p\)) is approximately **14.32%**. This represents the overall standard deviation of the portfolio returns, accounting for the variances of the individual assets and their covariances.

---


#### 3. Marginal and Total Risk Contributions

The marginal risk contribution of an asset \(i\) can then be calculated as:

\[
\text{Marginal Risk Contribution}_i = \frac{\text{Cov}(r_i, r_p)}{\sigma_p}
\]

This then gives us a total risk contribution of:

\[
RC_i = w_i \cdot \text{Marginal Risk Contribution}_i
\]

Using the portfolio data, we calculate the risk contributions:

| Asset    | Weight (\( w_i \)) | Risk Contribution (\( RC_i \)) | Risk Contribution (%) |
|----------|---------------------|-------------------------------|------------------------|
| Stock A  | 0.40                | 0.0748                        | 52.3%                 |
| Stock B  | 0.30                | 0.0461                        | 32.1%                 |
| Bond C   | 0.30                | 0.0223                        | 15.6%                 |

The percentages indicate how much each asset contributes to the total risk of the portfolio.

---



#### Key Observations
As with our basic example, marginal risk refers to how much additional risk each individual asset contributes to the overall portfolio considering both its weight and its relationship with other assets. The risk contribution of each asset gives us insight into its importance in determining the portfolio’s total risk. Let’s break down the risk contributions for each asset in this particular portfolio.

Looking at Stock A, we see that it holds a 40% weight in the portfolio and contributes 52.3% to the total risk. This makes Stock A the most significant contributor, highlighting that its higher volatility and strong correlations with the other assets drive the portfolio’s risk. Given its substantial impact, Stock A demands closer attention when managing portfolio risk.

In contrast, Stock B has a weight of 30% with a risk contribution of 32.1%. While its contribution is still significant, it’s less than Stock A’s, indicating that Stock B plays a moderate role in shaping the portfolio’s overall risk. This suggests that while Stock B is an important asset, its risk impact is more manageable compared to Stock A.

Lastly, Bond C stands out with its smaller risk contribution of just 15.6%, despite also holding a 30% weight. This reflects Bond C’s low volatility and weaker correlations with the other assets. The key benefit here is diversification. By helping to stabilize the overall portfolio, Bond C reduces the total risk, making it a crucial component for balancing the portfolio's risk profile.

The concept of marginal risk importance clearly allows us to assess how each asset influences the overall portfolio risk. In this case, Stock A is the dominant force in terms of risk, while Bond C plays a crucial stabilizing role. Understanding these risk contributions enables better decision-making for portfolio construction and management, ensuring that the portfolio remains balanced and aligned with risk tolerance objectives.