Nezha
====

> 最近刚好在上映《哪吒之魔童降世》,随便取了个名字

实现一个迷你的类React库，用作记录学习React源码时的一些理解

相关知识整理
* [实现一个简易的React](https://www.shymean.com/article/%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E7%AE%80%E6%98%93%E7%9A%84React)
* [VNode与递归diff](https://www.shymean.com/article/VNode%E4%B8%8E%E9%80%92%E5%BD%92diff)
* [Fiber与循环diff](https://www.shymean.com/article/Fiber%E4%B8%8E%E5%BE%AA%E7%8E%AFdiff)
* [VNode与Component](https://www.shymean.com/article/VNode%E4%B8%8EComponent)
* [理解数据状态管理](https://www.shymean.com/article/%E7%90%86%E8%A7%A3%E6%95%B0%E6%8D%AE%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86)

最后使用该项目通过SSR重构了自己的博客[Shymean](https://github.com/tangxiangmin/ShyMean)，[在线访问地址](https://www.shymean.com/)

## Step
```
# 开发模式
npm run dev

# ssr demo演示
npm run dev:ssr
npm run build:ssr

# 打包
npm run build
```

## Feature

* 虚拟DOM
    * [x] Fiber Reconciler简单实现
    * [x] diff、key
    * [x] SSR
* 组件
    * [x] 类组件
    * [x] 函数组件
    * [x] 类组件生命周期
    * [x] 路由组件
    * [ ] hooks
    * [ ] refs
    * [x] Context
* 状态管理
    * [x] Nax
    * [x] 中间件



