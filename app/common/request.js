/*数据请求封装*/

import queryString from 'query-string';
import _ from 'lodash';

var request = {};
var config = require('./config');

/**
 * @GET
 */
request.get = function (url, params) {
    if (params) {
        url += '?' + queryString.stringify(params);
    }
    return fetch(url)
        .then((response) => response.json())
        .then(responseData =>{
            return responseData;
        });
}

/**
 * @POST
 */
request.post = function (url, body) {
    var options = _.extend(config.header, {
        body: JSON.stringify(body)
    });
    return fetch(url, options)
        .then((response) => response.json())
        .then(responseData =>{
            return responseData;
        });
}

module.exports = request;