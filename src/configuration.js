const configuration = {
    url: null,
    environment: (global.settings.NODE_ENV || 'development'),

    debugging(){
        return this.environment.toLowerCase() === 'development';
    },

    getApiUrl(path){
        return this.url + path;
    },
}

if (!global.settings.API_URL) {
    throw new Error("Configuration item 'settings.API_URL' has not been set.");
}

configuration.url = `${global.settings.API_URL}${global.settings.API_URL.endsWith("/") ? "" : "/"}`;

if (Object.freeze){
    Object.freeze(configuration);
}

export default configuration;