/**
 * 为了避免层层传递props，对外提供一个Context接口
 * <MyContext>
 *     <App></App>
 * </MyContext>
 * 在App类组件中可以通过this.context获取到MyContext提供的外层数据
 *
 * 我们也可以增加一个特殊的prop：context，遇见如果props包含context，则向其所有子组件注入
 */



function createContext(defaultValue) {
}
