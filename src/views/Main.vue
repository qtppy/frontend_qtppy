

<template>
  <!-- <el-carousel :interval="4000" type="card" height="200px">
    <el-carousel-item v-for="item in itemArr" :key="item.title"> -->
      <!-- <h3 class="medium">{{ item.text }}</h3> -->
	  <!-- <img :src="item.src"/> -->
	  <!-- <span>{{ item.title }}</span> -->
	  <!-- <p>{{ item.text }}</p> -->
    <!-- </el-carousel-item>
  </el-carousel> -->
  <span ><p v-for="item in itemArr" :key="item.title">{{item.title}}: {{item.text}}</p></span>
</template>

<style>
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>

<script>
	export default {
		name: 'pt',
		data() {
			return {
				itemArr: [{
					title: '目的',
					text: '代码质量作为系统稳定性建设的核心的一环，要想提高系统稳定性，根本上要提升代码质量。我们希望通过一些普适性的东西来克服人为因素带来的一些影响，并且可以为以后复用。并且建立一套统一的标准，让提高质量不只是一句口号而是有章可依。',
					src: require('../../static/images/c.jpg'),
				},
				{
					title: '形式',
					text: '站在研发的立场看，自动化测试可以是代码层面简单的功能TestCase，也可以是接口层面的测试。如果要做全面的覆盖，两者对基础设施的要求是一样的,但是站在QA的立场来看，QA关心的是接口层面的返回，代码层面的东西不是特别关心。鉴于两方的述求，我们认为在接口层面做，对双方都有利。',
					src: require('../../static/images/b.jpg'),
				},
				{
					title: '内容梳理',
					text: '一个自动化测试的流程应该包含以下几步：初始化基础数据mock所有外部请求发起请求系统处理请求返回结果清理数据涉及的技术点：初始化数据工具，mock server及mock,结果对比，请理数据。我们希望只需要人工准备请求数据，初始化数据，以及返回结果，剩下的事情系统搞定。',
					src: require('../../static/images/a.jpg'),
				}]
			}
		},
	}

</script>
