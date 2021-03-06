const request = require('request');
const EsaAPI = require('@suin/esa-api');

module.exports = function (RED) {

  function EsaApiConfig(config) {
    RED.nodes.createNode(this, config);
    var node = this;
  }
  RED.nodes.registerType("esa-api-config", EsaApiConfig, {
    credentials: {
      apitoken: { type:"password" },
      teamname: { type:"text" }
    }
  });

  function EsaApi(config) {
    RED.nodes.createNode(this, config);

    this.current_setting = RED.nodes.getNode(config.setting);
    this.apitoken = this.current_setting.credentials.apitoken;
    this.teamname = this.current_setting.credentials.teamname;

    this.functiontype = config.functiontype;

    // console.log("this.current_setting", this.current_setting);

    // console.log("config.setting",config.setting);

    /*
    console.log("config",config);
    console.log("this",this);
    console.log("this.apitoken",this.apitoken);
    console.log("this.teamname",this.teamname);
    */

    let clientEsaIO = EsaAPI.createClient({
      token: this.apitoken
    });

    var node = this;
    node.on('input', async function (msg) {

      // console.log("this.current_setting", this.current_setting);

      this.status({ fill: "grey", shape: "ring", text: "[" + this.current_setting.name + "] connecting..." });

      if( this.functiontype == "createPost" ){

        // https://suin.github.io/esa-api/classes/postapi.html#createpost

        try {

          let params = {};
          params.teamName = this.teamname;
          params.post = msg.payload;

          let responses = await clientEsaIO.createPost(params);

          this.status({ fill: "green", shape: "dot", text: "[" + this.current_setting.name + "] " + this.functiontype });
          msg.payload = responses.data;
          node.send(msg);
        } catch(error) {
          this.status({ fill: "red", shape: "dot", text: "[" + this.current_setting.name + "] error" });
          node.error(error);
        }

      } else if( this.functiontype == "getPosts" ){

        // https://suin.github.io/esa-api/classes/postapi.html#getposts
        // sort : "number" | "comments" | "updated" | "created" | "stars" | "watches" | "best_match"
        // q : ??????????????????????????????????????????????????????
        // perPage : 1??????????????????????????????????????????
        // page : ???????????????
        // order: "asc" | "desc"
        // include: ("stargazers" | "comments" | "comments.stargazers")[]

        try {

          let params = msg.payload;
          params.teamName = this.teamname;

          // console.log("params",params);

          let responses = await clientEsaIO.getPosts(params);

          this.status({ fill: "green", shape: "dot", text: "[" + this.current_setting.name + "] " + this.functiontype });
          msg.payload = responses.data;
          node.send(msg);
        } catch(error) {
          this.status({ fill: "red", shape: "dot", text: "[" + this.current_setting.name + "] error" });
          node.error(error);
        }

      } else if( this.functiontype == "updatePost" ){

        // https://suin.github.io/esa-api/classes/postapi.html#updatepost
        // postNumber
        // updatePostBody

        // console.log("updatePost");

        try {
          
          // updatePostBody ???????????????????????????OK
          const params = {
            teamName:this.teamname ,
            postNumber: msg.payload.postNumber ,
            updatePostBody: {
              post:msg.payload.post
            }
          };

          // console.log("params",params);

          let responses = await clientEsaIO.updatePost(params);

          // console.log("responses",responses);

          this.status({ fill: "green", shape: "dot", text: "[" + this.current_setting.name + "] " + this.functiontype });
          msg.payload = responses.data;
          node.send(msg);
        } catch(error) {
          this.status({ fill: "red", shape: "dot", text: "[" + this.current_setting.name + "] error" });
          node.error(error);
        }

      } else if( this.functiontype == "getPost" ){
        
        // https://suin.github.io/esa-api/classes/postapi.html#getpost
        // postNumber
        // include -> 
        // `comments` ????????????????????????????????????????????????????????????????????????????????????
        // - `comments,comments.stargazers`?????????????????????????????????????????????????????????Star?????????????????????????????????????????????????????? 
        // - `stargazers` ??????????????????Star?????????????????????????????????????????????????????? 
        // - `stargazers,comments` ???????????? `,` ?????????????????????????????????????????????

        try {

          let responses = await clientEsaIO.getPost({
            teamName:this.teamname ,
            postNumber: msg.payload.postNumber });

          this.status({ fill: "green", shape: "dot", text: "[" + this.current_setting.name + "] " + this.functiontype });
          msg.payload = responses.data;
          node.send(msg);
        } catch(error) {
          this.status({ fill: "red", shape: "dot", text: "[" + this.current_setting.name + "] error" });
          node.error(error);
        }

      }
    });
  }
  RED.nodes.registerType("esa-api", EsaApi, {});
}