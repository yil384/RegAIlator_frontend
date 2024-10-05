const config = {
    // basename: only at build time to set, and don't add '/' at end off BASENAME for breadcrumbs, also don't put only '/' use blank('') instead,
    // like '/berry-material-react/react/default'
    basename: '/',
    dashboardPath: '/dashboard',
    defaultPath: '/session/login',
    // fontFamily: `'Roboto', sans-serif`,
    fontFamily: `'Poppins', sans-serif`,
    borderRadius: 12,
    // env: 'dev',
    env: 'prod',
    dev: {
        baseURL: 'http://localhost:3000/v1/',
        URL: 'http://localhost:3000/'
    },
    prod: {
        baseURL: 'http://localhost:3000/v1/',
        URL: 'http://localhost:3000/'
        // baseURL: 'http://praxi.guans.cs.kent.edu:3000/v1/',
        // URL: 'http://praxi.guans.cs.kent.edu:3000/'
    }
};

export default config;
