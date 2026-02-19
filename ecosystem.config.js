module.exports = {
    apps: [{
        name: "gymplat-app",
        script: "npm",
        args: "start",
        env: {
            NODE_ENV: "production",
            PORT: 3000
        }
    }]
}
