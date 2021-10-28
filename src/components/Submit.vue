<template>
  <div class="submission-form">
    <div class="submission-title-container">
      <h1 class="submission-title">Evaluate your service!</h1>   
    </div>
    <div class="submission-section">
      <p>1. Select a usecase</p>
    </div>
    <div class="submission-section">
      <button class="usecase-btn" @click="set_usecase(0)" v-bind:style="{backgroundColor: get_usecase_color(0)}">Where's Waldo</button>
      <button class="usecase-btn" @click="set_usecase(1)" v-bind:style="{backgroundColor: get_usecase_color(1)}">Racing game</button>
      <button class="usecase-btn" @click="set_usecase(2)" v-bind:style="{backgroundColor: get_usecase_color(2)}">Movie reviews</button>
      <button class="usecase-btn" @click="set_usecase(3)" v-bind:style="{backgroundColor: get_usecase_color(3)}">IQ Test</button>
    </div>
    <div class="submission-section">
      <p>2. What is your group UUID?</p>
      <input v-model="group_value" id="input-uuid" class="submission-input" v-bind:style="{ borderColor: group_color }" type="text"/>
      <button class="check-btn" @click="verify_group" v-bind:style="{backgroundColor: group_verified_status_color}">Check</button>
    </div>
    <div class="submission-section">
      <p>3. Where is your microservice located?</p>
      <input v-model="protocol_value" id="input-protocol" placeholder="http" class="submission-input" v-bind:style="{ borderColor: protocol_color }" type="text"/>
      <span>://</span>
      <input v-model="host_value" id="input-host" placeholder="0.0.0.0" class="submission-input" v-bind:style="{ borderColor: host_color }" type="text"/>
      <span>:</span>
      <input v-model="port_value" id="input-port" placeholder="4242" class="submission-input" v-bind:style="{ borderColor: port_color }" type="text"/>
      <span>/api/predict</span>
    </div>
    <div class="submission-section submission-info">
      <p>Usecase: <span v-bind:style="{ color: usecase_status_color}">{{ usecase_name }}</span></p>
      <p>Group status: <span v-bind:style="{ color: group_verified_status_color}">{{ group_verified_status }}</span></p>
      <p>Attempts: <span v-bind:style="{color: attempts_status_color}">{{ attempts_value }}</span></p>
      <p>Health check URL: <span>{{ full_health_url }} </span></p>
      <p>Health status: <span v-bind:style="{ color: verified_status_color}">{{ verified_status }}</span></p>
      <p>Submission URL: <span>{{ full_predict_url }}</span></p>
      <p>Submission status: <span v-bind:style="{color: submitted_status_color}">{{ submitted_status }}</span></p>
      <p>Score: <span v-bind:style="{color: grey}">{{ score_value }}</span></p>
    </div>
    <div v-if="show_health_check_button" class="submission-section">
      <p>4. Check the health endpoint of your service or try to submit against our validation dataset</p>
      <button class="action-btn" @click="verify_health_url" v-bind:style="{backgroundColor: verified_status_color}" >Health Check</button>
      <button class="action-btn" @click="validate" v-bind:style="{backgroundColor: validation_status_color}" >Test submittion</button>
    </div>
    <div v-if="show_submit_button" class="submission-section">
      <p>5. Submit</p>
      <button @click="submit_evaluation" class="action-btn">Submit</button>
    </div>
    <div class="submission-section submission-info">
      <textarea class="response-text-area" v-model="response_messages" rows="10" cols="50"></textarea>
    </div>   
  </div>
</template>

<script>
export default {
  data() {
    return {
      green: '#22a865',
      red: '#f72a1b',
      yellow: '#b5ab38',
      grey: 'grey',
      white: 'white'
    }
  },
  computed: {
    show_health_check_button: {
      get: function () {
        const protocol_valid = this.$store.getters.is_protocol_valid
        const host_valid = this.$store.getters.is_host_valid
        const port_valid = this.$store.getters.is_port_valid
        const is_url_valid = protocol_valid && host_valid && port_valid
        const group_valid = this.$store.getters.is_group_id_valid
        const group_verified = this.$store.state.group_verified
        return this.has_usecase_name && is_url_valid && group_valid && group_verified
      }
    },
    show_submit_button: {
      get: function() {
        const has_free_attempts = this.$store.getters.are_attempts_valid
        const health_verified = this.$store.state.verified
        return has_free_attempts && health_verified && this.has_usecase_name
      }
    },
    score_value: {
      get: function () {
        return this.$store.state.score
      }
    },
    protocol_value: {
      get: function() {
        return this.$store.state.protocol
      },
      set: function (value) {
        this.$store.commit('set_protocol', value)
      }
    },
    host_value: {
      get: function() {
        return this.$store.state.host
      },
      set: function (value) {
        this.$store.commit('set_host', value)
      }
    },
    port_value: {
      get: function() {
        return this.$store.state.port
      },
      set: function (value) {
        this.$store.commit('set_port', value)
      }
    },
    group_value: {
      get: function() {
        return this.$store.state.group
      },
      set: function(value) {
        this.$store.commit('set_group', value)
      }
    },
    attempts_value: {
      get: function() {
        return this.$store.getters.attempts_text
      }
    },
    full_health_url: {
      get: function () {
        return this.$store.getters.health_url
      }
    },
    full_predict_url: {
      get: function () {
        return this.$store.getters.predict_url
      }
    },
    usecase_name: {
      get: function () {
        return this.$store.getters.usecase_name
      },
      set: function (value) {
        this.$store.commit('set_usecase', value)
      }
    },
    has_usecase_name: {
      get: function () {
        return this.$store.state.usecase in [0,1,2,3]
      }
    },
    usecase_status_color: {
      get: function () {
        if (this.has_usecase_name) return this.green
        return this.red
      }
    },
    attempts_status_color: {
      get: function () {
        if (this.$store.getters.are_attempts_valid) return this.green
        return this.red
      }
    },
    group_verified_status: {
      get: function () {
        if(this.$store.state.group_verifying) return 'processing...'
        return this.$store.state.group_verified ? 'verified' : 'not verified'
      }
    },
    group_verified_status_color: {
      get: function () {
        if(this.$store.state.group_verifying) return this.yellow
        return this.$store.state.group_verified ? this.green : this.red
      }
    },
    verified_status: {
      get: function () {
        if (this.$store.state.verifying) return 'processing...'
        return this.$store.state.verified ? 'verified' : 'not verified'
      }
    },
    verified_status_color: {
      get: function () {
        if (this.$store.state.verifying) return this.yellow
        return this.$store.state.verified ? this.green : this.red
      }
    },
    submitted_status: {
      get: function () {
        if (this.$store.state.submitting) return 'submitting...'
        return this.$store.state.submitted ? 'submitted' : 'not submitted'
      }
    },
    submitted_status_color: {
      get: function () {
        if (this.$store.state.submitting) return this.yellow
        return this.$store.state.submitted ? this.green : this.red
      }
    },
    validation_status_color: {
      get: function () {
        if (this.$store.validating) return this.yellow
        return this.white
      }
    }, 
    protocol_color: {
      get: function () {
        if (this.$store.getters.is_protocol_valid) return this.green
        return this.red
      }
    },
    host_color: {
      get: function () {
        if (this.$store.getters.is_host_valid) return this.green
        return this.red
      }
    },
    port_color: {
      get: function () {
        if (this.$store.getters.is_port_valid) return this.green
        return this.red
      }
    },
    group_color: {
      get: function () {
        if (this.$store.getters.is_group_id_valid) return this.green
        return this.red
      }
    },
    response_messages: {
      get: function () {
        return this.$store.getters.formatted_response_messages
      }
    }
  },
  methods: {
    verify_health_url() {
      this.$store.dispatch('verify_health_url')
    },
    verify_group() {
      this.$store.dispatch('verify_group')
      this.$store.dispatch('get_attempts')
    },
    get_usecase_color(usecase_id) {
      const is_selected = this.$store.state.usecase === usecase_id
      if (is_selected) return this.green
      else return this.grey
    },
    set_usecase(usecase_id) {
      this.usecase_name = usecase_id
      this.$store.dispatch('get_attempts')
    },
    submit_evaluation() {
      this.$store.dispatch('submit_evaluation')
    },
    validate() {
      this.$store.dispatch('submit_validation')
    }
  }
}
</script>

<style scoped>
  ::placeholder {
    color: grey
  }

  #input-protocol{ width: 50px }
  #input-host{ width: 150px }
  #input-port{ width: 50px }
  #input-uuid{ width: 75% }

  .submission-form{
    height: 1150px;
    width: 900px;
    background-color: rgb(65, 57, 57);
    box-shadow: 15px 15px 10px #888;
    margin: auto;
    border-radius: 1%;
  }
  .submission-title{
    font-size: 30px;
    color:white;
    font-family:monospace;
    font-weight: 400;
  }
  .submission-title-container{
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .usecase-btn{
    height:30px;
    width: 120px;
    margin: 0 10px;
    border-radius: 15px;
    border: none;
    background-color: white;
  }
  .action-btn{
    height:30px;
    width: auto;
    margin: 0 10px;
    border-radius: 15px;
    border: none;
    background-color: white;
    padding-left: 15px;
    padding-right: 15px;
  }
  .check-btn{
    border-radius: 15px;
    border: none;
    height: 25px;
  }
  .usecase-btn, .check-btn:hover{
    cursor: pointer;
  }
  .submission-section{
    color: rgb(182, 182, 182);
    font-family: monospace;
    font-size:15px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  /* .submittion-section-task{
    text-align: left;
    margin-left: 50px;
  } */
  .submission-info{
    text-align: left;
    margin-left: 20px;
    margin-top: 50px;
    margin-bottom: 50px; 
  }
  .submission-input{
    color:black;
    background-color:#999;
    border-radius: 15px;
    padding-left: 10px;
    margin-left: 10px; 
    margin-right: 10px;
    border: 3px solid white;
  }
  #input-protocol{
    width: 100px !important;
  }
  #input-host{
    width: 200px !important;
  }
  #input-port{
    width: 100px !important;
  }
  .submission-input:focus{
    outline: none;
  }
  .response-text-area{
    float: left;
    display: block;
    width: 96%;
    background-color: #888;
  }
</style>
