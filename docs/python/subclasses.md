# Python `__subclasses__`

Python 中可以使用 `__subclasses__` 方法来获取某个类的所有直接子类的列表。

```python
class A:
    pass


class B(A):
    pass


class C(A):
    pass


direct_classes = A.__subclasses__()
print(direct_classes)  # [<class '__main__.B'>, <class '__main__.C'>]
```

如果想要获取所有子类（包括间接子类），可以递归地使用 `__subclasses__` 方法

```python
class A:
    pass


class B(A):
    pass


class C(B):
    pass


def get_all_subclasses(cls):
    subclasses = set(cls.__subclasses__())
    for subclass in list(subclasses):
        subclasses.update(get_all_subclasses(subclass))
    return subclasses


print(get_all_subclasses(A)) # {<class '__main__.C'>, <class '__main__.B'>}
```
