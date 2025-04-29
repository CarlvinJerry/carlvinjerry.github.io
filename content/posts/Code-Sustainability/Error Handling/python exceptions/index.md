---

title: "Mastering Python's Exceptional Complexity"
description: "Mastering Python's Exceptional Complexity for Sustainable Error Handling"
date: 2023-09-14T06:00:20+06:00
image:  images/errors.jpg
hero: errors.jpg
menu:
  sidebar:
    name: Exception Handling in Python
    identifier: Exception Handling
    parent: Error-Handling
tags: ["Python", "Exceptions", "Code Sustainability"]
categories: ["Code Sustainability"]

---

#### Introduction

Exception handling is a fundamental pillar of programming, and Python in particular, excels in this area given its robust and versatile error management system. A program terminates immediately it encounters an error, typically taking one of two forms: **syntax errors** and **exceptions**.  In this article, we'll demystify exceptions, distinguishing them from syntax errors, and explore the art of effectively managing them. Finally, we will look at some advanced techniques coupled with best practices for gracefully handling exceptions.

<br>

##### Exceptions versus Syntax Errors

<a href="https://realpython.com/invalid-syntax-python/" target="_blank">Syntax errors</a> occur during the ***parsing phase*** before code execution. The interpreter detects syntax errors whenever the code violates the rules and structure of the Python language, leading to a complete halt of the program. Observe the following examples:

* Missing a colon after a def statement:

```python
#Code with missing collon
def my_function(a , b)  #SyntaxError:unexpectedEOFwhileparsing
 print(a + b)
```
<br>

```python
 File "<ipython-input-2-b7d4e84eafb5>", line 2
    def my_function(a , b)  # SyntaxError: unexpected EOF while parsing
                       ^
SyntaxError: expected ':'
```

<br>

The arrow in the our output indicates exactly where the parser ran into the **syntax error**. Fixing the code yields a different result. As an example, testing the function with any two integers gives us their sum:

```python
#Fixed code
def my_function(a , b):# No error
 print( a+b )

#Test
my_function(5,6)

>>11
```

<br>

* Using an undefined variable:

```python
print(undefined_variable)  # NameError: name 'undefined_variable' is not defined
```
<br>

```python
---------------------------------------------------------------------------
NameError                                 Traceback (most recent call last)
<ipython-input-12-b3b3b04032c5> in <cell line: 1>()
----> 1 print(undefined_variable)

NameError: name 'undefined_variable' is not defined
```

<br>

* Mismatched parentheses:

```python
print("Hello, World!"  # SyntaxError: unexpected EOF while parsing
```
<br>

```python
File "<ipython-input-14-dbee6e3a1c9e>", line 1
    print("Hello, World!"  # SyntaxError: unexpected EOF while parsing
                                                                      ^
SyntaxError: incomplete input
```

<br>
<br>

<a href="https://docs.python.org/3/library/exceptions.html" target="_blank">Exceptions</a> are ***runtime*** errors occurring during the execution of a Python program. They occur due to unforeseen conditions or events while the program is running. These can often be handled using try-except blocks to gracefully handle errors without crashing the program. Using our very first function as an example:

```python
#Fixed code
def my_function(a , b):
 print( a+b )

#Test
my_function(5, "6") # This will raise a TypeError
```
<br>

```python
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-17-bf67fa8c0e95> in <cell line: 6>()
      4 
      5 #Test
----> 6 my_function(5, "6")

<ipython-input-17-bf67fa8c0e95> in my_function(a, b)
      1 #Fixed code
      2 def my_function(a , b):
----> 3  print( a+b )
      4 
      5 #Test

TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

We can observe that passing a non-numeric argument to `my_function` raises a `TypeError`, which in itself is a type of exception error.

<br>

* Division by zero:

```python
x = 5
y = 0
result = x / y  # ZeroDivisionError: division by zero
```
<br>

```python
---------------------------------------------------------------------------
ZeroDivisionError                         Traceback (most recent call last)
<ipython-input-18-53a6f18aaf2b> in <cell line: 3>()
      1 x = 5
      2 y = 0
----> 3 result = x / y  # ZeroDivisionError: division by zero

ZeroDivisionError: division by zero
```

<br>

* Accessing an out-of-range index

```python
my_list = [1, 2, 3]
value = my_list[5]  # IndexError: list index out of range
```

<br>


```python
---------------------------------------------------------------------------
IndexError                                Traceback (most recent call last)
<ipython-input-19-c5deeffe54f1> in <cell line: 2>()
      1 my_list = [1, 2, 3]
----> 2 value = my_list[5]  # IndexError: list index out of range

IndexError: list index out of range
```

<br>

The takeaway here is that exception errors will occur whenever the correct syntax of your python code yields an error.

<br>
<br>

#### Exception Handling: The Basics

Python's exception handling framework consists of four distinct **blocks**, each strategically designed to address specific tasks within an error-handling statement.

<br>

##### Try/Except Blocks

This block is used to catch and handle exceptions that occur within a try block. When an exception is raised in the try block, the code within the corresponding except block is executed, allowing you to handle the exception by providing specific error-handling logic.

```python
try:
    # Code that might raise an exception
except SomeException:
    # Handle SomeException
```

<br>

##### Try/Finally Blocks

The `finally` block gets executed void of a raised exception or lack thereof. We employ the `try/finally` construct in situations where we desire exceptions to propagate upwards in the call stack, yet simultaneously need to execute cleanup code, ensuring it runs even when exceptions are raised. This ensures that essential cleanup operations are consistently performed, regardless of whether an exception occurs. Common cleanup operations involve tasks like closing files or releasing resources.

```python
handle = open('somefile.txt')  #May raise IOError
try:
    # Code that might raise an exception
    data = handle.read()  #May raise UnicodeDecodeError
finally:
    handle.close() #Will always run after `try:`
```

<br>

Regardless of whether an exception occurs, the finally block guarantees that the file is closed, ensuring proper cleanup and resource management. This is a common pattern for ensuring that critical resources are released, even in the presence of exceptions. To illustrate the above better, observe the code output below:

```python
#handle = open('somefile.txt')  #May raise IOError
try:
    # Code that might raise an exception
    #data = handle.read()  #May raise UnicodeDecodeError
    x = 10 / 0  # This will raise a ZeroDivisionError
except ZeroDivisionError as e:
    print(f"An error occurred: {e}") #This will run when there is an exception
finally:
    #handle.close() #Will always run after `try:`
    print("Cleanup: Closing open files, releasing resources, etc.")
```
<br>

```python
An error occurred: division by zero
Cleanup: Closing open files, releasing resources, etc.
```  

<br>

> A `try block` executes its code until it encounters the first exception. Within the `except block`, which serves as the exception handler, we have the ability to define the program's response to that specific exception. It is also possible to anticipate and handle multiple types of exceptions separately.

<br>

##### Try/Else Blocks

The `else` block is executed whenever there are no exceptions raised in the preceding try block.

```python
try:
    # Code that might raise an exception
except SomeException:
    # Handle SomeException
else:
    # Code to run when no exceptions occur
```

<br>

The use of try/except/else allows us to explicitly specify which exceptions our code will handle and which exceptions will be allowed to propagate upward. This approach also aids in reducing the amount of code within the try block, resulting in improved code readability. Assuming we want to load JSON dictionary data from a string and return the value of a random key from it:

```python
def load_json_key(data, key):
  try:
    result_dict = json.loads(data) #May raise ValueError
  except ValueError as e:
      raise KeyEror from e
  else:
      return result_dict[key]   #May raise KeyError
```

<br>

The `json.loads(data)` function loads JSON data from the data variable. If the data isn't valid JSON, a `ValueError` is raised and passed up to the calling code. Within the `except block`, if a `ValueError` is caught, it's replaced with a `KeyError` using `raise KeyError from e`. This new KeyError then propagates up to the calling code.  

If the JSON data is valid, the `else block` is executed. It attempts to access a specific key in `result_dict`. If the key isn't found, a `KeyError` is raised within the else block and propagates up to the calling code. The else clause serves to visually separate the code following the try/except block from the except block. This distinction enhances the clarity of the exception propagation behavior.

<br>

#### Taking advantage of each block (try/except/else/finally)

To handle it all in one compound statement, we can employ `try/except/else/finally` functionalities together. Combining all the blocks provides a comprehensive way to manage errors and control program flow. Here's a brief illustration:

```python
def divide(x, y):
    try:
        result = x / y  # May raise ZeroDivisionError
    except ZeroDivisionError as e:
        print(f"Error: {e}")
    else:
        print(f"Result: {result}")
    finally:
        print("Cleanup: Closing resources")

# Test cases
divide(10, 2)  # No exception, both 'else' and 'finally' run
divide(10, 0)  # Exception (ZeroDivisionError), 'except' and 'finally' run
```

<br>

Test case 1-No exception, both 'else' and 'finally' run:

```python
Result: 5.0
Cleanup: Closing resources
```

<br>

Test case 2- Exception (ZeroDivisionError), 'except' and 'finally' run:

```python
Error: division by zero
Cleanup: Closing resources
```

<br>

As we have illustrated, each block has a distinct role, and they work together intuitively:

The `try block` encloses the code that may potentially raise an exception. It's the starting point where we anticipate and handle potential errors. This block is essential for maintaining program stability. The `except block` comes into play when an exception is raised within the try block. It simply allows us to specify how to handle different types of exceptions. By catching specific exceptions, we can provide tailored error-handling strategies. This block enhances program resilience by gracefully dealing with errors.  

The `else block` is executed only if no exceptions were raised in the try block. It allows us to place code that should run when everything runs flawless. This block is useful for separating error-handling logic from regular code, making the code more readable and maintainable. Lastly, The `finally block` is executed regardless of whether an exception was raised or not. This block ensures that all essential cleanup operations are performed, contributing to code reliability.  

> The combined layout is useful as it encourages structured error handling and promotes key benefits such as:

* Clarity: Each block's role is clearly defined, making the code easier to understand and maintain. Error-handling logic is separated from regular code, enhancing code readability.
* Resilience: The except block allows for specific exception handling, enabling the program to respond appropriately to various error scenarios. This improves program resilience by addressing potential issues gracefully.
* Robustness: The finally block guarantees that critical cleanup operations are executed, even in the presence of exceptions. This helps maintain the integrity of the program.
* Control: By combining all these blocks, you have fine-grained control over how your program responds to errors, ensuring that it continues to function smoothly even in challenging situations.

In the next post,  we explore some advanced techniques coupled with best practices for gracefully handling exceptions.

<br>
<br>

#### Credits
<a href="https://storyset.com/people">People illustrations by Storyset</a> on Freepik.