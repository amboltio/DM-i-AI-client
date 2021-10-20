import { createStore } from "vuex";

export default createStore({
    state: {
        protocol: "",
        host: "",
        port: "",
        usecase: undefined,
        verified: false,
        verifying: false,
        submitted: false,
        submitting: false,
        group: "",
        group_verified: false,
        group_verifying: false,
        response_messages: [],
        attempts: -1,
        attempts_verifying: false,
        max_attempts_waldo: '2',
        max_attempts_race_car: '-',
        max_attempts_reviews: '3',
        max_attempts_iq_test: '1'
    },
    mutations: {
        reset_validation_state(state) {
            state.verified = false;
            state.submitted = false;
        },
        set_verified_satus(state, value) {
            state.verified = value
        },
        set_protocol (state, value) {
            this.commit('reset_validation_state')
            state.protocol = value;
        },
        set_host (state, value) {
            this.commit('reset_validation_state')
            state.host = value;
        },
        set_port (state, value) {
            this.commit('reset_validation_state')
            state.port = value;
        },
        set_usecase (state, value) {
            this.commit('reset_validation_state')
            if (value in [0,1,2,3] === false) {
                state.usecase = undefined
                return
            }
            state.usecase = value
        },
        set_group (state, value) {
            this.commit('reset_validation_state')
            state.group_verified = false
            state.group = value
        },
        add_response (state, value) {
            const date = new Date()
            const date_str = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            const message = `[${date_str}] ${value}`
            state.response_messages.push(message)
        }
    },
    actions: {
        async submit_evaluation({ state, commit, getters, dispatch }) {
            try{
                if (state.submitting) {
                    commit('add_response', 'Submission in process, please wait...')
                    return
                }
                state.submitting = true
                const payload = {
                    "host_url": getters.raw_url,
                    "group_id": state.group
                }
                const response = await fetch(getters.submission_url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })

                if (response.status == 200) {
                    state.submitting = false
                    state.submitted = true
                    commit('add_response', 'Submission successful.')
                }
                else {
                    state.submitting = false
                    state.submitted = false
                    commit('add_response', 'Submission failed.')
                }
                dispatch('get_attempts')
            }
            catch (error) {
                commit('reset_validation_state')
                commit('add_response', 'Submission failed.')
                state.submitting = false
            }
        },
        async verify_health_url({ getters, commit, state }) {
            try {
                const url = getters.health_url
                console.log(url)
                this.commit('add_response', 'Performing health check...')
                state.verifying = true
                const response = await fetch(url, { method: 'GET' })  
                state.verifying = false
                if(response.status === 200) {
                    this.commit('set_verified_satus', true)
                    this.commit('add_response', 'Health check successfull.')
                }
                else {
                    this.commit('set_verified_satus', false)
                    this.commit('add_response', 'Health check failed.')
                }
            } catch (error) {
                commit('reset_validation_state')
                state.verifying = false
                commit('add_response', 'Health check failed.')
            }
        },
        async verify_group({ commit, state }) {
            try {
                const url = `http://20.86.76.212:4242/group/validate?group_id=${state.group}`
                this.commit('add_response', 'Verifying group UUID...')
                state.group_verifying = true
                const response = await fetch(url, { method: 'GET' })
                state.group_verifying = false
                if(response.status === 200) {
                    state.group_verified = true
                    this.commit('add_response', 'Group verification successfull.')
                }
                else {
                    state.group_verified = false
                    this.commit('add_response', 'Group verification failed.')
                }
            } catch (error) {
                commit('reset_validation_state')
                state.group_verifying = false
            }
        },
        async get_attempts({ state, getters }) {
            try {
                this.commit('add_response', 'Fetching number of attempts for selected usecase...')
                const url = getters.attempts_url
                
                if (!url) {
                    this.commit('add_response', 'Failed to fetch attempts, because usecase needs to be selected.')
                    return
                }
                if (state.group.length === 0){
                    this.commit('add_response', 'Failed to fetch attempts, because group has to be entered.')
                    return
                }

                
                state.attempts_verifying = true
                fetch(url)
                    .then(response => {
                        if (response.status !== 200) throw 'Cannot get attempts'
                        else return response.json()
                    })
                    .then(data => {
                        const attempts = data["data"]["attempts"]
                        state.attempts_verifying = false
                        state.attempts = attempts.length
                        this.commit('add_response', 'Attempts fetched successfully..')
                    })
                    .catch(error => {
                        console.log(error)
                        state.attempts = -1
                        state.attempts_verifying = false
                        this.commit('add_response', 'Failed to fetch attempts.')
                    })
            } catch (error) {
                console.log('here')
                state.attempts = -1
                state.attempts_verifying = false
                return
            }
        }
    },
    getters: {
        health_url: state => {
            return `${state.protocol}://${state.host}:${state.port}/api`
        },
        predict_url: state => {
            return `${state.protocol}://${state.host}:${state.port}/api/predict`
        },
        raw_url: state => {
            return `${state.protocol}://${state.host}:${state.port}`
        },
        usecase_name: state => {
            if (state.usecase === 0) return 'Where\'s Waldo'
            if (state.usecase === 1) return 'Racing game'
            if (state.usecase === 2) return 'IQ Test'
            if (state.usecase === 3) return 'Movie reviews'
            else return '[Not selected]'
        },
        attempts_text: (state, getters) => {
            const current_amount = state.attempts === -1 ? '?' : state.attempts
            const cap = getters.attempts_cap
            if (cap === undefined) return `${current_amount}/?`
            else return `${current_amount}/${cap}`
        },
        attempts_cap: state => {
            if (state.usecase === 0) return state.max_attempts_waldo
            if (state.usecase === 1) return state.max_attempts_race_car
            if (state.usecase === 2) return state.max_attempts_reviews
            if (state.usecase === 3) return state.max_attempts_iq_test
            return undefined
        },
        attempts_url: state => {
            const base = 'http://20.86.76.212:4242'
            if (state.usecase === 0) return `${base}/wheres-waldo?group_id=${state.group}`
            if (state.usecase === 1) return `${base}/racing-game?group_id=${state.group}`
            if (state.usecase === 2) return `${base}/movie-reviews?group_id=${state.group}`
            if (state.usecase === 3) return `${base}/iq-test?group_id=${state.group}`
            return undefined
        },
        submission_url: state => {
            const base = 'http://20.86.76.212:4242'
            if (state.usecase === 0) return `${base}/wheres-waldo`
            if (state.usecase === 1) return `${base}/racing-game`
            if (state.usecase === 2) return `${base}/movie-reviews`
            if (state.usecase === 3) return `${base}/iq-test`
            return undefined
        },
        is_protocol_valid: state => {
            return state.protocol === 'http' ||  state.protocol === 'https'
        },
        is_host_valid: state => {
            const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
            return regex.test(state.host)
        },
        is_port_valid: state => {
            return !isNaN(state.port) && state.port >= 0 && state.port <= 65535 && String(state.port).length === 4
        },
        is_group_id_valid: state => {
            const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            return regex.test(state.group)
        },
        are_attempts_valid: (state, getters) => {
            if (state.attempts < 0 || state.usecase in [0,1,2,3] === false) return false
            const cap = getters.attempts_cap
            if (cap === undefined || state.attempts >= cap) return false
            return true
        },
        formatted_response_messages: state => {
            return state.response_messages.join('\n')
        }
    }
})