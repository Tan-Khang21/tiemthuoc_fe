import { login, refreshToken } from '@/api/auth'
import router from '@/router'

const state = {
    name: null,
    id: null,
    code: null,
};

const mutations = {
    SET_NAME: (state, name) => {
        state.name = name;
    },
    SET_ID: (state, id) => {
        state.id = id;
    },
    SET_CODE: (state, code) => {
        state.code = code;
    }
};

const actions = {
    // user login
    login({ commit }, userInfo) {
        return new Promise((resolve, reject) => {
            login(userInfo)
                .then((resData) => {
                    if(resData.access_token){
                        localStorage.setItem('user', JSON.stringify(resData.user))
                        localStorage.setItem('token', resData.access_token)
                    }
                    router.push({ name: 'home' });                                    
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    refreshToken({ commit }, userInfo) {
        return new Promise((resolve, reject) => {
            refreshToken(userInfo)
                .then((resData) => {
                    if(resData.access_token){
                        localStorage.setItem('user', JSON.stringify(resData.user))
                        localStorage.setItem('token', resData.access_token)
                    }
                    resolve();
                })
                .catch((error) => {
                    router.push({ name: 'login' });                                    
                    reject(error);
                });
        });
    },


}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
