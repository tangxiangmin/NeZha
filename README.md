Nezha
====

实现一个迷你的类React库，用作记录学习React源码时的一些理解

> 最近刚好在上映《哪吒之魔童降世》,随便取了个名字

相关知识整理
* [VNode与递归diff](https://www.shymean.com/article/VNode%E4%B8%8E%E9%80%92%E5%BD%92diff)
* [Fiber与循环diff](https://www.shymean.com/article/Fiber%E4%B8%8E%E5%BE%AA%E7%8E%AFdiff)
* [VNode与Component](https://www.shymean.com/article/VNode%E4%B8%8EComponent)
* [实现一个简易的React](https://www.shymean.com/article/%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E7%AE%80%E6%98%93%E7%9A%84React)

最近将花时间重构调度器、diff和DOM系统。

## Step
```
# 开发模式
npm run dev
```

## Feature
* [x] 类组件
* [ ] 声明周期
* [x] 函数组件
* [ ] hooks
* [x] 事件系统
* [x] diff算法、key
* [x] Fiber Reconciler简单实现
* [ ] Router
* [ ] Context
* [ ] SSR
* [ ] 集成Redux
