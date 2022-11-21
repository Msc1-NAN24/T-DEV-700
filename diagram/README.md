# PlantUML diagrams

[Website](https://plantuml.com/)

[Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

## Class diagram

![Diagram](./Database.svg)

## Architecture diagram

![diagrame d'infrastucture](./architechture.svg)

## Markdown integration example

```plantuml:md-sample-sequence
@startuml
actor Foo123
boundary Foo2
control Foo3
entity Foo4
database Foo5
collections Foo6
Foo1 -> Foo2 : To boundary
Foo1 -> Foo3 : To control
Foo1 -> Foo4 : To entity
Foo1 -> Foo5 : To database
Foo1 -> Foo6 : To collections
@enduml
```

![Above example](./md-sample-sequence.svg)
