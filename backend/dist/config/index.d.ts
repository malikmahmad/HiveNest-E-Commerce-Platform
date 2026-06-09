export declare const config: {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpires: string;
        refreshExpires: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    isProd: boolean;
};
//# sourceMappingURL=index.d.ts.map