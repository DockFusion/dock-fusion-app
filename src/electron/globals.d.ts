interface CertificateStatus {
    valid: boolean;
    reason?: string;
    certificateDetails?: any;
}

interface WSLStatus {
    defaultDistribution: string | null;
    defaultVersion: string | null;
}

interface WSLDistribution {
    name: string;
    state: string;
    version: string;
}
