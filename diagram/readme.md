# doc pour les diagrammes puml :

https://plantuml.com/fr/

(installer `jebbs.plantuml` dans vscode)

# 1er esquice du diagrame de class

![diagrame de class](./class.svg)

# 1er esquisse du diagramme d'architecture

![diagrame d'infrastucture](./architechture.svg)

# exemple dans le md

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

![exemple ramdom qui est au dessus](./md-sample-sequence.svg)
