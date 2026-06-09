export declare const sendEmail: (to: string, subject: string, html: string) => Promise<void>;
export declare const sendVerificationEmail: (to: string, name: string, token: string) => Promise<void>;
export declare const sendPasswordResetEmail: (to: string, name: string, token: string) => Promise<void>;
export declare const sendOrderConfirmationEmail: (to: string, name: string, orderNumber: string, total: number, items: Array<{
    name: string;
    quantity: number;
    price: number;
}>) => Promise<void>;
//# sourceMappingURL=email.d.ts.map