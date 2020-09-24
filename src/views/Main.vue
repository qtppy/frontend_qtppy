<template>
  <div class="we-alert">
	  <div v-for="item in itemArr" :key="item.title">
		  <h6>{{item.title}}</h6>
		  <p>{{item.text}}</p>
	  </div>

  </div>
</template>

<style scoped>
  .we-alert {
    margin-bottom: 1px;
    margin-left: 1px;
	margin-top: 25px;
    padding: 11px 40px;
	border: 1px solid #dde9ed;
    border-color: #d5eafb;
    background-color: #fcfdfd;
    font-size: 14px;
	line-height: 27px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
	letter-spacing: 2px;
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
