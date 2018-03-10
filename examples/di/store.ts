import { bind, Container, Getter, Inject, State } from 'vue-class-state';

// 定义注入标识
export const StateKeys = {
    A: 'stateA',
    B: 'stateB',
    STORE: 'store'
};

export class StateA {
    // 定义可观察数据
    @State text = 'A';
}

export class StateB {
    @State text = 'B';
}

export class Store {

    // 根据注入标识在将实例注入到类实例属性中
    // 并且在第一次读取该属性时才进行初始化
    // @Inject(StateKeys.A)  stateA!: StateA

    constructor(
        // 根据注入标识在将实例注入到构造器参数中
        @Inject(StateKeys.A) public stateA: StateA,
        @Inject(StateKeys.B) public stateB: StateB
    ) {
    }

    // 定义计算属性,
    // 并且在第一次读取该属性时才进行该计算属性的初始化
    @Getter get text() {
        return this.stateA.text + this.stateB.text;
    }

}

// 定义容器
@Container({
    providers: [
        // 绑定注入规则，一个标识对应一个类实例（容器范围内单例注入）
        bind<StateA>(StateKeys.A).toClass(StateA),
        bind<StateB>(StateKeys.B).toClass(StateB),
        bind<Store>(StateKeys.STORE).toClass(Store)
    ],
    // 开启严格模式
    strict: true
})
export class AppContainer { }
