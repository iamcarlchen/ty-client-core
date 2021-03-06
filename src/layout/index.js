//布局相关积木
import bblayoutcanvasedit from './bb-layout-canvas-edit.vue';
import bblayoutcanvas from './bb-layout-canvas.vue';
//container-edit
import bblayoutcontainer from './bb-layout-container.vue';
//grid-edit
import bblayoutgrid from './bb-layout-grid.vue';
import bblayoutseriationedit from './bb-layout-seriation-edit.vue';
import bblayoutseriation from './bb-layout-seriation.vue';
import bbpageedit from './bb-page-edit.vue';
import bbpage from './bb-page';
import bbseriationitemedit from './bb-seriation-item-edit.vue';
import bbseriationitemedith5 from './bb-seriation-item-edit-h5.vue';

export default {
	install: function(Vue) {
		Vue.component('bb-layout-canvas-edit', bblayoutcanvasedit);
		Vue.component('bb-layout-canvas', bblayoutcanvas);
		Vue.component('bb-layout-container', bblayoutcontainer);
		Vue.component('bb-layout-grid', bblayoutgrid);
		Vue.component('bb-layout-seriation-edit', bblayoutseriationedit);
		Vue.component('bb-layout-seriation', bblayoutseriation);
		Vue.component('bb-page-edit', bbpageedit);
		Vue.component('bb-page', bbpage);
		Vue.component('bb-seriation-item-edit', bbseriationitemedit);
		Vue.component('bb-seriation-item-edit-h5', bbseriationitemedith5);
		console.log("成功加载布局积木;");
	}
};