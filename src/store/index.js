import { createStore } from "vuex";

export default createStore({
    state: {
        protocol: "",
        host: "",
        port: "",
        usecase: undefined,
        verified: false,
        verifying: false,
        validating: false,
        submitted: false,
        submitting: false,
        group: "",
        group_verified: false,
        group_verifying: false,
        response_messages: [],
        attempts: -1,
        attempts_verifying: false,
        max_attempts_waldo: '1',
        max_attempts_race_car: '1',
        max_attempts_reviews: '1',
        max_attempts_iq_test: '1',
        evaluation_server_base_url: 'https://dm-ai-evaluation.westeurope.cloudapp.azure.com',
        score: '-',
        group_name: 'Not set',
        alert: false
    },
    mutations: {
        reset_validation_state(state) {
            state.verified = false;
            state.submitted = false;
        },
        set_verified_satus(state, value) {
            state.verified = value
        },
        set_protocol(state, value) {
            this.commit('reset_validation_state')
            state.protocol = value;
        },
        set_host(state, value) {
            this.commit('reset_validation_state')
            state.host = value;
        },
        set_port(state, value) {
            this.commit('reset_validation_state')
            state.port = value;
        },
        set_usecase(state, value) {
            this.commit('reset_validation_state')
            if (value in [0, 1, 2, 3] === false) {
                state.usecase = undefined
                return
            }
            state.usecase = value
        },
        set_group(state, value) {
            this.commit('reset_validation_state')
            state.group_verified = false
            state.group = value
        },
        add_response(state, value) {
            const date = new Date()
            const date_str = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            const message = `[${date_str}] ${value}`
            state.response_messages.push(message)
        }
    },
    actions: {
        async get_group_name({ state, commit }) {
            try {
                const url = `https://dm-ai-evaluation.westeurope.cloudapp.azure.com/group/name?group_id=${state.group}`
                fetch(url, {
                    method: 'GET'
                }).then(response => {
                    if (response.status == 200) return response.json()
                    else throw 'Cannot get group name'
                }).then(data => {
                    console.log(data)
                    const group_name = data["data"]["group_name"]
                    console.log(group_name)
                    state.group_name = group_name
                }).catch(error => {
                    console.log(error)
                    state.group_name = 'Not set'
                })
            } catch (error) {
                commit('add_response', 'Failed to load group name.')
            }
        },
        async submit_validation({ state, commit, getters }) {
            try {
                if (state.validating || state.submitting) {
                    commit('add_response', 'Validation or submission in process, please wait...')
                    return
                }
                state.validating = true
                const payload = {
                    "host_url": getters.raw_url,
                    "group_id": state.group
                }

                state.score = 'processing...'
                fetch(getters.validation_url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).then(response => {
                    if (response.status == 200) return response.json()
                    else throw `Cannot communicate with host url ${getters.raw_url}.`
                }).then(data => {
                    state.score = data["data"]["score"]
                    state.validating = false
                    commit('add_response', `Validation successful. Score: ${state.score}`)
                }).catch(error => {
                    console.log(error)
                    state.validating = false
                    state.score = '-'
                    commit('add_response', 'Validation failed.')
                    commit('add_response', error)
                })
            }
            catch (error) {
                commit('reset_validation_state')
                commit('add_response', 'Valudation submission failed.')
                state.validating = false
            }
        },
        async submit_evaluation({ state, commit, getters, dispatch }) {
            try {
                if (state.validating || state.submitting) {
                    commit('add_response', 'Validation or submission in process, please wait...')
                    return
                }
                state.submitting = true
                const payload = {
                    "host_url": getters.raw_url,
                    "group_id": state.group
                }

                state.score = 'processing...'
                fetch(getters.submission_url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).then(response => {
                    if (response.status == 200) return response.json()
                    else throw `Cannot communicate with host url ${getters.raw_url}.`
                }).then(data => {
                    state.score = data["data"]["score"]
                    state.submitting = false
                    state.submitted = true
                    commit('add_response', `Submission successful. Score: ${state.score}`)
                    dispatch('get_attempts')
                }).catch(error => {
                    console.log(error)
                    state.submitting = false
                    state.submitted = false
                    state.score = '-'
                    commit('add_response', 'Submission failed.')
                    commit('add_response', error)
                    dispatch('get_attempts')
                })
            }
            catch (error) {
                commit('reset_validation_state')
                commit('add_response', 'Submission failed.')
                state.submitting = false
            }
        },
        async verify_health_url({ getters, commit, state }) {
            try {
                this.commit('add_response', 'Performing health check...')
                state.verifying = true
                const url = `${state.evaluation_server_base_url}/group/health?host_url=${getters.health_url}`
                const response = await fetch(url, { method: 'GET' })
                state.verifying = false
                if (response.status === 200) {
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
                const url = `${state.evaluation_server_base_url}/group/validate?group_id=${state.group}`
                this.commit('add_response', 'Verifying group UUID...')
                state.group_verifying = true
                const response = await fetch(url, { method: 'GET' })
                state.group_verifying = false
                if (response.status === 200) {
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
                if (state.group.length === 0) {
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

                        let no_attempts = 0
                        attempts.forEach(element => {
                            if (element['is_validation']) return
                            no_attempts += 1
                        });
                        state.attempts = no_attempts
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
        health_url: (state, getters) => {
            return `${getters.raw_url}/api`
        },
        predict_url: state => {
            return `${state.protocol}://${state.host}:${state.port}/api/predict`
        },
        raw_url: state => {
            return `${state.protocol}://${state.host}:${state.port}`
        },
        attempts_url: state => {
            if (state.usecase === 0) return `${state.evaluation_server_base_url}/wheres-waldo?group_id=${state.group}`
            if (state.usecase === 1) return `${state.evaluation_server_base_url}/racing-game?group_id=${state.group}`
            if (state.usecase === 2) return `${state.evaluation_server_base_url}/movie-reviews?group_id=${state.group}`
            if (state.usecase === 3) return `${state.evaluation_server_base_url}/iq-test?group_id=${state.group}`
            return undefined
        },
        submission_url: state => {
            if (state.usecase === 0) return `${state.evaluation_server_base_url}/wheres-waldo`
            if (state.usecase === 1) return `${state.evaluation_server_base_url}/racing-game`
            if (state.usecase === 2) return `${state.evaluation_server_base_url}/movie-reviews`
            if (state.usecase === 3) return `${state.evaluation_server_base_url}/iq-test`
            return undefined
        },
        validation_url: state => {
            if (state.usecase === 0) return `${state.evaluation_server_base_url}/wheres-waldo/validate`
            if (state.usecase === 1) return `${state.evaluation_server_base_url}/racing-game/validate`
            if (state.usecase === 2) return `${state.evaluation_server_base_url}/movie-reviews/validate`
            if (state.usecase === 3) return `${state.evaluation_server_base_url}/iq-test/validate`
            return undefined
        },
        usecase_name: state => {
            if (state.usecase === 0) return 'Where\'s Waldo'
            if (state.usecase === 1) return 'Racing game'
            if (state.usecase === 2) return 'Movie reviews'
            if (state.usecase === 3) return 'IQ Test'
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
        is_protocol_valid: state => {
            return state.protocol === 'http' || state.protocol === 'https'
        },
        is_host_valid: state => {
            const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
            return regex.test(state.host)
        },
        is_port_valid: state => {
            return state.port !== undefined && state.port !== '' && !isNaN(state.port) && state.port >= 0 && state.port <= 65535
        },
        is_group_id_valid: state => {
            const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            return regex.test(state.group)
        },
        are_attempts_valid: (state, getters) => {
            if (state.attempts < 0 || state.usecase in [0, 1, 2, 3] === false) return false
            const cap = getters.attempts_cap
            if (cap === undefined || state.attempts >= cap) return false
            return true
        },
        formatted_response_messages: state => {
            return state.response_messages.join('\n')
        }
    }
})