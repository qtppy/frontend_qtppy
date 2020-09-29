<template>
	<div id="app">
		<!-- 路由组件缓存 -->
		<transition name="fade" mode="out-in">
			<keep-alive>
			    <router-view v-if="$route.meta.KeepAlive"></router-view>
			</keep-alive>
		</transition>
		<!-- 路由组件不缓存 -->
		<transition name="fade" mode="out-in">
			<keep-alive>
			    <router-view v-if="!$route.meta.KeepAlive"></router-view>
			</keep-alive>
		</transition>
	</div>
</template>

<script>
export default {
	name: 'app',
	components: {
	}
}

</script>

<style lang="scss">
body {
	margin: 0px;
	padding: 0px;
	/*background: url(assets/bg1.jpg) center !important;
		background-size: cover;
	background: #1F2D3D;*/
	font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
	font-size: 14px;
	-webkit-font-smoothing: antialiased;
}

#app {
	position: absolute;
	top: 0px;
	bottom: 0px;
	width: 100%;
}

.el-submenu [class^=fa] {
	vertical-align: baseline;
	margin-right: 10px;
}

.el-menu-item [class^=fa] {
	vertical-align: baseline;
	margin-right: 10px;
}

.toolbar {
	background: #f2f2f2;
	padding: 10px;
	//border:1px solid #dfe6ec;
	margin: 10px 0px;
	.el-form-item {
		margin-bottom: 10px;
	}
}


// 淡入淡出
.fade-enter, .fade-leave-active {
	opacity: 0;
}
.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
	-webkit-transition: opacity .2s;
}
</style>