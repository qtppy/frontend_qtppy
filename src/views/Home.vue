<template>
	<el-row class="container">
		<el-col 
			:span="24" class="header">
			<el-col 
				:span="5" 
				class="logo" 
				:class="isCollapse?'logo-collapse-width':'logo-width'">
				<div>
					<a href="/main">
					    <img style="vertical-align:middle" src="static/js/favicon.ico">
					</a>
					<a>{{sysName}}</a>
				</div>
			</el-col>
			<el-col :span="12">
				<div 
					class="tools"  
					@click.prevent="collapse">
					<i class="fa fa-align-justify"></i>
				</div>
			</el-col>
			<el-col 
				:span="7" 
				class="userinfo">
				<span>
					<i class="el-icon-s-operation"></i>
					<el-button 
						type="text" 
						style="color:#FFFFFF;"
						@click="argsListVisible = true">
						参数列表
					</el-button>
				</span>
				<span>&nbsp;</span>
				<span>
					<i class="el-icon-s-grid"></i>
					<el-button 
						type="text" 
						style="color:#FFFFFF;"
						@click="systemFunctionVisible = true">
						系统函数
					</el-button>
				</span>
				<span>&nbsp;</span>
				<span>
					<i class="el-icon-coin"></i>
					<el-button 
						type="text" 
						style="color:#FFFFFF;">
						数据源管理
					</el-button>
				</span>
				<span>&nbsp;&nbsp;</span>
				<el-dropdown trigger="hover">
					<span 
						class="el-dropdown-link userinfo-inner"> 
						<i class="el-icon-user-solid"></i>
						{{sysUserName}}
					</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item>我的消息</el-dropdown-item>
						<el-dropdown-item>设置</el-dropdown-item>
						<el-dropdown-item 
							divided 
							@click.native="loginOut">
							退出登录
						</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-col>
			<el-drawer
				:visible.sync="argsListVisible"
				direction="rtl"
				size="40%"
				:wrapperClosable="true"
				:withHeader="false"
				>
				<template slot="title">
					<span>
						<i class="el-icon-info"></i>
						自定义参数
					</span>
				</template>
				<el-table :data="globalData">
					<el-table-column 
						prop="name" 
						label="全局参数变量" 
						width="150">
						<template slot-scope="scope">
							{{scope.row.name}}
						</template>
					</el-table-column>
					<el-table-column 
						prop="value" 
						label="" 
						width="200">
						<template slot-scope="scope">
							{{scope.row.value}}
						</template>
					</el-table-column>
					<el-table-column label="">
						<template slot-scope="scope">
							<el-tooltip
								content="点击复制" 
								placement="bottom" 
								effect="light">
								<el-link
									type="primary"
									:underline="false"
									v-clipboard:copy="'${'+scope.row.name+'}'"
									v-clipboard:success="onCopy"
									v-clipboard:error="onError"
									>
									<i class="el-icon-document-copy"></i>
								</el-link>
							</el-tooltip>
						</template>
					</el-table-column>
				</el-table>
			</el-drawer>
			<!-- 系统函数 -->
			<el-drawer
				:visible.sync="systemFunctionVisible"
				direction="rtl"
				size="40%"
				:wrapperClosable="true"
				:withHeader="false"
				>
				<el-collapse 
					v-model="activeName" 
					accordion>
					<el-collapse-item name="1">
						<template slot="title">
							<span>
								<i class="el-icon-share"></i>
								常用函数
							</span>
						</template>
						<el-table 
							:data="sysCommonUseTable"
							:show-header="false"
							:highlight-current-row="true">
							<el-table-column prop="name">
								<template slot-scope="scope">
									<span>{{scope.row.name}}</span>
								</template>
							</el-table-column>
							<el-table-column prop="value">
								<template slot-scope="scope">
									<span>{{scope.row.value}}</span>
								</template>
							</el-table-column>
							<el-table-column  fixed="right" width="40">
								<template slot-scope="scope">
									<el-tooltip 
										content="点击复制" 
										placement="bottom" 
										effect="light">
										<el-link
											type="primary"
											:underline="false"
											v-clipboard:copy="scope.row.value.substr(2)"
											v-clipboard:success="onCopy"
											v-clipboard:error="onError"
											>
											<i class="el-icon-document-copy"></i>
									</el-link>
									</el-tooltip>
								</template>
							</el-table-column>
						</el-table>
					</el-collapse-item>
					<el-collapse-item name="2">
						<template slot="title">
							<span>
								<i class="el-icon-lock"></i>
								加密函数
							</span>
						</template>
						<el-table 
							:data="sysEncryptTable"
							:show-header="false"
							:highlight-current-row="true">
							<el-table-column prop="name">
								<template slot-scope="scope">
									{{scope.row.name}}
								</template>
							</el-table-column>
							<el-table-column prop="value">
								<template slot-scope="scope">
									{{scope.row.value}}
								</template>
							</el-table-column>
							<el-table-column  fixed="right" width="40">
								<template slot-scope="scope">
									<el-tooltip 
										content="点击复制" 
										placement="bottom" 
										effect="light">
										<el-link
											type="primary"
											:underline="false"
											v-clipboard:copy="scope.row.value.substr(2)"
											v-clipboard:success="onCopy"
											v-clipboard:error="onError"
											>
											<i class="el-icon-document-copy"></i>
									</el-link>
									</el-tooltip>
								</template>
							</el-table-column>
						</el-table>
					</el-collapse-item>
					<!-- 随机函数 -->
					<el-collapse-item name="3">
						<template slot="title">
							<span>
								<i class="el-icon-s-grid"></i>
								随机函数
							</span>
						</template>
						<el-table 
							:data="sysRandomTable"
							:show-header="false"
							:highlight-current-row="true">
							<el-table-column prop="name">
								<template slot-scope="scope">
									{{scope.row.name}}
								</template>
							</el-table-column>
							<el-table-column prop="value">
								<template slot-scope="scope">
									{{scope.row.value}}
								</template>
							</el-table-column>
							<el-table-column  fixed="right" width="40">
								<template slot-scope="scope">
									<el-tooltip 
										content="点击复制" 
										placement="bottom" 
										effect="light">
										<el-link
											type="primary"
											:underline="false"
											v-clipboard:copy="scope.row.value.substr(2)"
											v-clipboard:success="onCopy"
											v-clipboard:error="onError"
											>
											<i class="el-icon-document-copy"></i>
									</el-link>
									</el-tooltip>
								</template>
							</el-table-column>
						</el-table>
					</el-collapse-item>
					<!-- 四则运算 -->
					<el-collapse-item name="3">
						<template slot="title">
							<span>
								<i class="el-icon-mobile-phone"></i>
								四则运算
							</span>
						</template>
						<el-table 
							:data="sysCountTable"
							:show-header="false"
							:highlight-current-row="true">
							<el-table-column prop="name">
								<template slot-scope="scope">
									{{scope.row.name}}
								</template>
							</el-table-column>
							<el-table-column prop="value">
								<template slot-scope="scope">
									{{scope.row.value}}
								</template>
							</el-table-column>
							<el-table-column  fixed="right" width="40">
								<template slot-scope="scope">
									<el-tooltip 
										content="点击复制" 
										placement="bottom" 
										effect="light">
										<el-link
											type="primary"
											:underline="false"
											v-clipboard:copy="scope.row.value.substr(2)"
											v-clipboard:success="onCopy"
											v-clipboard:error="onError"
											>
											<i class="el-icon-document-copy"></i>
									</el-link>
									</el-tooltip>
								</template>
							</el-table-column>
						</el-table>
					</el-collapse-item>
				</el-collapse>
			</el-drawer>
		</el-col>

		<el-col :span="24" class="main">
            <el-scrollbar style="height: 100%">
				<el-menu
					default-active="$route.path" 
					class="el-menu-vertical-demo"
					router
					:unique-opened="true" 
					:collapse="isCollapse">

					<template v-for="(item, index) in $router.options.routes">
						<el-submenu 
							:index="index +''" 
							v-if="!item.hidden && !item.leaf" 
							:key="item.name">
							<template 
								slot="title">
								<i :class="item.iconCls"></i>
								<span slot="title">{{item.name}}</span>
							</template>
                            <el-menu-item 
								v-for="child in item.children" 
								:index="child.path" 
								:key="child.path" 
								v-if="!child.hidden">
								<span slot="title">{{child.name}}</span>
                            </el-menu-item>
						</el-submenu>
                        <el-menu-item 
							v-if="item.leaf && item.children.length > 0" 
							:index="item.children[0].path" 
							:key="item.name">
                            <i :class="item.iconCls"></i>
							<span slot="title">{{item.children[0].name}}</span>
                        </el-menu-item>
					</template>
				</el-menu>
            </el-scrollbar>
			<section class="content-container">
				<div class="grid-content bg-purple-light">
					<el-col :span="24" class="breadcrumb-container">
						<strong class="title">{{$route.name}}</strong>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" class="content-wrapper">
						<transition name="fade" mode="out-in">
							<router-view></router-view>
						</transition>
					</el-col>
				</div>
			</section>
		</el-col>
	</el-row>
</template>

<script>
	import { logout, getVarByUid, getSystemFunc } from '@/api/api'
	export default {
		data() {
			return {
				sysName:'QTPPY自动化测试平台',
				isCollapse: false,
				collapsed:false,
				sysUserName: '',
				sysUserAvatar: '',
				form: {
					name: '',
					region: '',
					date1: '',
					date2: '',
					delivery: false,
					type: [],
					resource: '',
					desc: ''
				},
				// 全局参数
				argsListVisible: false,
				globalData: [],
				// 系统函数
				systemFunctionVisible: false,
				sysCommonUseTable: [],
				sysEncryptTable: [],
				sysRandomTable: [],
				sysCountTable: [],
				activeName: '1',

			}
		},
		methods: {
			onSubmit() {
				console.log('submit!');
			},
			handleopen(key, keyPath) {
				console.log(key, keyPath);
			},
			handleclose(key, keyPath) {
				console.log(key, keyPath);
			},
			handleselect: function (a, b) {
			},
			//退出登录
			loginOut: function () {
				var _this = this;
				this.$confirm('确认退出吗?', '提示', {
					//type: 'warning'
				}).then(() => {
					logout();
					sessionStorage.removeItem('user');
					_this.$router.push('/login');
				}).catch(() => {

				});


			},
			//折叠导航栏
			collapse:function(){
				// this.collapsed=!this.collapsed;
				this.isCollapse = !this.isCollapse;
			},
			showMenu(i,status){
				this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-'+i)[0].style.display=status?'block':'none';
			},

			/**
			 * 复制内容到剪贴版
			 */
			onCopy(e) {
				this.$message({
					message: '内容已复制到剪贴版,请直接粘贴',
					type: 'success'
				});
			},
			onError(e) {
				this.$message({
					message: '复制失败，请手动选择复制',
					type: 'error'
				});
			},

			/**
			 * 获取全局变量
			 */
			getVar() {
				// 全局变量
				getVarByUid().then(res => {
					this.globalData = res.res;
				});
				// 系统函数
				getSystemFunc().then(res =>{
					for(let i=0; i<res.res.length;i++){
						// 常用函数
						if (res.res[i].type === 1) {
							this.sysCommonUseTable.push(
								res.res[i]
							);
						};
						// 加密函数
						if (res.res[i].type === 2) {
							this.sysEncryptTable.push(
								res.res[i]
							);
						};
						// 加密函数
						if (res.res[i].type === 3) {
							this.sysRandomTable.push(
								res.res[i]
							);
						};
						// 加密函数
						if (res.res[i].type === 4) {
							this.sysCountTable.push(
								res.res[i]
							);
						};
					};
				});

			},

		},
		mounted() {
			var user = sessionStorage.getItem('user');
			if (user) {
				user = JSON.parse(user);
				this.sysUserName = user.name || '';
				this.sysUserAvatar = user.avatar || '';
			};
			this.getVar();
		}
	}

</script>

<style scoped-slot lang="scss">
	@import '~scss_vars';
	// 不显示左侧边栏横向滚动条
	.el-scrollbar__wrap {
		overflow-x: hidden;
	}
	// 侧边栏
	.el-menu-vertical-demo:not(.el-menu--collapse) {
		width: 230px;
		min-height: 400px;
		height: 100vh;
		// background: #3C526A; //左侧边栏背景颜色
	}		
	.container {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
		.header {
			height: 60px;
			line-height: 60px;
			background: #3C526A; // $color-primary 蓝色最上边导航栏，背景颜色
			color:#fff;
			.userinfo {
				text-align: right;
				padding-right: 35px;
				float: right;
				.userinfo-inner {
					cursor: pointer;
					color:#fff;
					img {
						width: 40px;
						height: 40px;
						border-radius: 20px;
						margin: 10px 0px 10px 10px;
						float: right;
					}
				}
			}
			.logo {
				//width:230px;
				height:60px;
				font-size: 16px;
				padding-left:0px;
				padding-right:0px;
				border-color: rgba(238,241,146,0.3);
				border-right-width: 1px;
				border-right-style: solid;
				img {
					width: 28px;
					float: left;
					margin: 15px 10px 10px 14px;
				}
				.txt {
					color:#fff;
				}
			}
			.logo-width{
				width:230px;
			}
			.logo-collapse-width{
				width:65px
			}
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			// background: #324057;
			position: absolute;
			top: 60px;
			bottom: 0px;
			overflow: hidden;
			aside {
				flex:0 0 230px;
				width: 230px;
				// position: absolute;
				// top: 0px;
				// bottom: 0px;
				
				.el-menu{
					height: 100%;
				}
				.collapsed{
					width:60px;
					.item{
						position: relative;
					}
					.submenu{
						position:absolute;
						top:0px;
						left:60px;
						z-index:99999;
						height:auto;
						display:none;
					}

				}
			}
			.menu-collapsed{
				flex:0 0 60px;
				width: 60px;
			}
			.menu-expanded{
				flex:0 0 230px;
				width: 230px;
			}
			.content-container {
				// background: #f1f2f7;
				flex:1;
				// position: absolute;
				// right: 0px;
				// top: 0px;
				// bottom: 0px;
				// left: 230px;
				overflow-y: scroll;
				padding: 20px;
				.breadcrumb-container {
					//margin-bottom: 15px;
					.title {
						width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
				}
				.content-wrapper {
					background-color: #fff;
					box-sizing: border-box;
				}
			}
		}
	}
</style>