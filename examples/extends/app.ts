import { bind, Container, Getter, State } from 'vue-class-state';

class Super {
    @State public super = 'Super';

    @Getter get superGetter() {
        return this.super;
    }
}

class Base extends Super {
    @State public base = 'Base';

    @Getter get baseGetter() {
        return this.base;
    }
}

class Child extends Base {
    @State public child = 'Child';

    @Getter get childGetter() {
        return this.child;
    }
}

@Container({
    providers: [bind<Child>('child').toClass(Child)],
    devtool: ['child']
})
class AppContainer { }

new AppContainer()

