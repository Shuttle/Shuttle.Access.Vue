const configuration = {
    url: null,
    environment: (import.meta.env.VITE_NODE_ENV || 'development'),

    debugging(){
        return this.environment.toLowerCase() === 'development';
    },

    getApiUrl(path){
        return this.url + path;
    },
}

if (!import.meta.env.VITE_API_URL) {
    throw new Error("Configuration item 'import.meta.env.VITE_API_URL' has not been set.");
}

configuration.url = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_URL.endsWith("/") ? "" : "/"}`;

if (Object.freeze){
    Object.freeze(configuration);
}

export default configuration;