---
title: DATA MINING FROM TWITTER USING R | C A R L V I N || BEYOND RAW DATA
author: Carlvin J Mwange
date: 2020-06-15
categories: [Data Mining, R]
---

# DATA MINING FROM TWITTER USING R

Getting started with Text mining using Twitter and R.

## Introduction

Social media usage has grown rapidly over the past few decades. Most social networks we can think of now are so well established, making them a platform where people can not only interact but also a haven for anyone in need of "unstructured" data. With an almost constant rate of increasing users each day, social networks such as Facebook and Twitter have become great sources of data which can be used in the broad field of Data Science. Talk of (those pretty annoying) targeted ads for example...

With the help of APIs, we can fetch data from such platforms to analyze and gather the information we want. In this post, we will go through the preliminaries of text mining from Twitter using R. The main advantage of Twitter APIs is that the data extracted from them comes in a well-structured format, a `dataframe`, which makes our work easier when crunching.

In this case, we will use the readily available Twitter API and create our own app to help us fetch the data.

## Creating a Twitter App

To create a Twitter app we can use for fetching metadata, we first need to have a Twitter account. We then need to go to the [Twitter Developer Site](https://developer.twitter.com/) and log in with our user account.

On the top right corner should be a drop-down menu next to your username, go to APPS. At this point, if you are doing this for the first time, your "Apps" section should be blank. Click on "Create an app" to create an app.

We then have to fill in the form below appropriately. Here is a breakdown of what’s required:

- **Name:** Give your app a unique name of your choice, e.g., "UniqueName".
- **Description:** This can always be changed later, use this to provide a brief note on what your app is all about to be able to distinguish it from other apps you might create in the future.
- **Website:** This should be your application's home page website. It is, however, not applicable for most personal apps. Anything goes here, e.g., "https://carlvinjerry.github.io".
- **Callback URL:** If you don't have a callback URL, you can use "http://127.0.0.1:1410". This can be changed later if needed.

Once you have filled in all the required details, you can click on the "Create" button. After successful creation, you will be redirected to the app's settings page. Here, navigate to the "Keys and tokens" tab.

You should be able to see your "API key" and "API secret key" on this page. Scroll down, and you will find the "Access token & access token secret" section. Click on the "Generate" button to generate your access token and access token secret.

Make sure to copy all the keys and tokens you have generated as we will use them in the R code to connect to the Twitter API.

That's it! You have successfully created a Twitter app and obtained the necessary keys and tokens to access the Twitter API. In the next section, we will write some R code to fetch data from Twitter.

Stay tuned for Part II!
