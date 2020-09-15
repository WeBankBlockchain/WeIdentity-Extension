import WeIdDoc from "../popup/pages/weIdDocument";

const uuid = require('uuid-random')
const axios = require('axios')
const secp256k1 = require("secp256k1")
const {Keccak} = require("sha3")
const bip39 = require('bip39')
const {hdkey} = require('ethereumjs-wallet')
const stringify = require('fast-json-stable-stringify')

const ErrorCode = {
    SUCCESS: {code: 0, description: "success"},
    CREDENTIAL_EXPIRE_DATE_ILLEGAL: {code: 100409, description: "expire date illegal"},
    CREDENTIAL_PUBLIC_KEY_NOT_EXISTS: {code: 100421, description: "public key for verifying credential signature does not exist"},
    CREDENTIAL_TYPE_NOT_SUPPORTED: {code: 200000, description: "only lite is supported"},
    ILLEGAL_INPUT: {code: 160004, description: "input parameter is illegal."},
    CPT_ID_ILLEGAL: {code: 100303, description: "cptId illegal"},
    CREDENTIAL_ISSUER_INVALID: {code: 100418, description: "credential issuer invalid or mismatch the WeID auth"},
    CREDENTIAL_CLAIM_NOT_EXISTS: {code: 100410, description: "claim data does not exist"},
    CREDENTIAL_ISSUANCE_DATE_ILLEGAL: {code: 100408, description: "credential issuance date illegal"},
    CREDENTIAL_EXPIRED: {code: 100402, description: "credential is expired"},
    CREDENTIAL_SIGNATURE_NOT_EXISTS: {code: 100422, description: "signature for verifying credential does not exist"},
    CREDENTIAL_SIGNATURE_BROKEN: {code: 100405, description: "credential signature cannot be extracted"},
    CREDENTIAL_VERIFY_FAIL: {code: 100441, description: "credential verify fail"},
    WEID_PRIVATEKEY_INVALID: {code: 100103, description: "the input private key is invalid, please check and input your private key"},
    WEID_INVALID: {code: 100101, description: "the weIdentity DID is invalid."}
}

const Api = function (url, fetch_type) {

    this.url = url
    this.fetch_type = fetch_type

    const constructApiData = function (functionArg, functionName, transactionArg) {
        let data = {}
        data["functionArg"] = functionArg
        data["functionName"] = functionName
        data["transactionArg"] = transactionArg
        data["v"] = "1.0.0."
        return data
    }

    this.invoke = async function (functionArg, functionName, transactionArg) {
        let data = constructApiData(functionArg, functionName, transactionArg)
        return await fetch({
            data: data,
            success: (res) => {return res},
            url : this.url + 'weid/api/invoke',
            config: 'post'
        }, this.fetch_type)
    }

    const fetch = async function (config, fetch_type) {
        if (fetch_type === "chrome") {
            return await sendRequestToBackground(config)
        } else if (fetch_type === "normal") {
            config.success = (res) => {alert(res)}
            return await apiRequest(config)
        }
    }

    const apiRequest = async function (config) {
        if (config.data === undefined) {
            config.data = {}
        }
        config.method = config.method || 'post'

        // 放在请求头里的Access-Token，根据业务需求，可从localstorage里获取。演示代码暂为空。
        let headers = {'Access-Token': ''}

        let data = null
        if (config.formData) {
            headers['Content-Type'] = 'multipart/form-data'
            data = new FormData()
            Object.keys(config.data).forEach(function (key) {
                data.append(key, config.data[key])
            });
        } else {
            data = config.data
        }

        let axiosConfig = {
            method: config.method,
            url: config.url,
            headers
        }
        if (config.method === 'get') {
            axiosConfig.params = data
        } else {
            axiosConfig.data = data
        }
        let result = await axios(axiosConfig)
        if (result.status === 200) {
            return result
        } else {
            return null
        }
    }

    const sendRequestToBackground = async function (config) {
        alert(config.url)
        config.apiType = 'background'
        if (window.chrome && window.chrome.runtime) {
            window.chrome && window.chrome.runtime.sendMessage({
                contentRequest: 'apiRequest',
                config: config,
            }, (result) => {
                // 接收background script的sendResponse方法返回的消数据result
                config.done && config.done()
                if (result.result === 'succ') {
                    config.success && config.success(result)
                } else {
                    config.fail && config.fail(result.msg)
                }
            })
        } else {
            console.log('未找到chrome API')
        }
    }

}


const WeIdService = function (api) {
    this.api = api

    this.createWeId = async function (publicKey) {
        const functionArg = {"publicKeySecp256k1": publicKey}
        const functionName = "createWeIdWithPubKey"
        const transactionArg = {"invokerWeId": "admin"}

        return await this.api.invoke(functionArg, functionName, transactionArg)
    }

    this.getWeIdDocument = async function (weId) {
        const functionArg = {"weId": weId}
        const functionName = "getWeIdDocument"
        return await this.api.invoke(functionArg, functionName, {})
    }
}

const Utils = (function() {
    function Utils () {}

    Utils.generateMnemonic = function () {
        return bip39.generateMnemonic()
    }

    Utils.createKeyPairWithM = function (mnemonic) {
        let seed = bip39.mnemonicToSeedSync(mnemonic)
        let keys = hdkey.fromMasterSeed(seed).getWallet()
        if (isPubKeyValid(keys.getPublicKey()) &&  isPrivateKeyValid(keys.getPrivateKey())) {
            const privateKey = keys.getPrivateKey().toString('base64')
            const publicKey = keys.getPublicKey().toString('base64')
            return {publicKey: publicKey, privateKey: privateKey}
        }
        return null
    }

    Utils.createKeyPair = function () {
        while (true) {
            let mnemonic = bip39.generateMnemonic()
            let seed = bip39.mnemonicToSeedSync(mnemonic)

            let keys = hdkey.fromMasterSeed(seed).getWallet()
            if (isPubKeyValid(keys.getPublicKey()) &&  isPrivateKeyValid(keys.getPrivateKey())) {
                const privateKey = keys.getPrivateKey().toString('base64')
                const publicKey = keys.getPublicKey().toString('base64')
                return {mnemonic: mnemonic, publicKey: publicKey, privateKey: privateKey}
            }
        }
    }

    Utils.generatePublicKey = function (privateKey) {
        let privateKeyBytes = Buffer.from(privateKey, 'base64')
        let publicKeyBytes = secp256k1.publicKeyCreate(privateKeyBytes, false)
        return Buffer.from(publicKeyBytes.slice(1)).toString('base64')
    }

    Utils.secp256k1Signature = function (rawData, privKey) {
        const privBytes = Buffer.from(privKey, "base64")
        const sig = secp256k1.ecdsaSign(this.keccakHash(rawData), privBytes)
        const signedMsgBuff = Buffer.from(concatenate(Uint8Array, sig.signature, [sig.recid]))
        return signedMsgBuff.toString("base64")
    }

    Utils.verifySecp256k1Signature = function (rawdata, signature, publicKey) {
        const sig = convertRSV(signature)
        const keyBytes = Buffer.from(publicKey, "base64")
        return secp256k1.ecdsaVerify(sig.signature, Utils.keccakHash(rawdata), concatenate(Uint8Array, [4], keyBytes))
    }

    Utils.keccakHash = function (rawData) {
        const keccak256 = new Keccak(256)
        keccak256.update(rawData)
        return keccak256.digest()
    }

    const convertRSV = function (signatureBase64) {
        const msgData = Buffer.from(signatureBase64, "base64");
        return {
            signature: msgData.slice(0, 64),
            recid: msgData[64]
        }
    }

    const concatenate = function (resultConstructor, ...arrays) {
        let totalLength = 0;
        for (let arr of arrays) {
            totalLength += arr.length;
        }
        let result = new resultConstructor(totalLength);
        let offset = 0;
        for (let arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }

    const isPubKeyValid = function (publicKey) {
        let _publicKey = Int8Array.from(publicKey)
        return _publicKey.length === 64 && _publicKey[0] >= 16;

    }

    const isPrivateKeyValid = function (privateKey) {
        let _privateKey = Int8Array.from(privateKey)
        return _privateKey.length === 32 && _privateKey[0] !== 0;
    }

    return Utils
}())

const CredentialService = (function () {

    function CredentialService() {}

    const Constant = {
        WEID_PREFIX: "did:weid:",
        WEID_SEPARATOR: ":",

        DEFAULT_CREDENTIAL_TYPE : "VerifiableCredential",
        CREDENTIAL_TYPE_LITE1 : "lite1",
        SECP256K1 : "Secp256k1",
        PROOF_TYPE : "type",
        PROOF : "proof",
        PROOF_SIGNATURE : "signatureValue",
        CONTEXT : "context",
        CLAIM : "claim",

        DEFAULT_CONTEXT : "https://github.com/WeBankFinTech/WeIdentity/blob/master/context/v1",
    }

    CredentialService.createCredential = function (cptId, issuanceDate, expirationDate, issuerWeId, issuerPrivateKey, type, claim) {
        let errorcode = isCredentialArgsValid(cptId, issuerWeId, issuerPrivateKey, claim, issuanceDate, expirationDate)
        if (errorcode.code !== ErrorCode.SUCCESS.code) {
            return {respbody: null, error: errorcode}
        }
        let result = {}
        result.context = Constant.DEFAULT_CONTEXT
        result.id = uuid()
        result.cptId = cptId
        if (issuanceDate === null) {
            result.issuanceDate = new Date().getTime()
        } else {
            result.issuanceDate = issuanceDate
        }
        result.issuer = issuerWeId
        if (expirationDate !== null) {
            result.expirationDate = expirationDate
        } else {
            return {respbody: null, error: ErrorCode.CREDENTIAL_EXPIRE_DATE_ILLEGAL}
        }
        result.type = []
        result.type.push(Constant.DEFAULT_CREDENTIAL_TYPE)
        result.type.push(type)

        result.claim = claim
        if (type === Constant.CREDENTIAL_TYPE_LITE1) {
            const credential = createLiteCredential(result, issuerPrivateKey)
            return {respbody: credential, error: ErrorCode.SUCCESS}
        } else {
            // other type of credential is not support now
            return {respbody: null, error: ErrorCode.CREDENTIAL_TYPE_NOT_SUPPORTED}
        }
    }

    CredentialService.verifyCredential = function (publicKey, credential) {
        if (publicKey === null || publicKey.length === 0) {
            return {respbody: false, error: ErrorCode.CREDENTIAL_PUBLIC_KEY_NOT_EXISTS}
        }
        if (credential.type.includes(Constant.CREDENTIAL_TYPE_LITE1)) {
            return verifyLiteCredential(credential, publicKey)
        } else {
            return {respbody: false, error: ErrorCode.CREDENTIAL_TYPE_NOT_SUPPORTED}
        }
    }

    CredentialService.getHash = function (credential) {
        const credentialStr = JSON.stringify(credential)
        return Utils.keccakHash(credentialStr)
    }

    const verifyLiteCredential = function (credential, publicKey) {
        if (credential.cptId === null || credential.cptId < 0) {
            return {respbody: false, error: ErrorCode.CPT_ID_ILLEGAL}
        }
        if (!isWeIdValid(credential.issuer)) {
            return {respbody: false, error: ErrorCode.CREDENTIAL_ISSUER_INVALID}
        }
        if (credential.claim === null || credential.claim.length === 0) {
            return {respbody: false, error: ErrorCode.CREDENTIAL_CLAIM_NOT_EXISTS}
        }
        if (credential.proof === null
            || !credential.proof.hasOwnProperty(Constant.PROOF_SIGNATURE)
            || credential.proof[Constant.PROOF_SIGNATURE] === null
            || credential.proof[Constant.PROOF_SIGNATURE].length === 0) {
            return {respbody: false, error: ErrorCode.CREDENTIAL_SIGNATURE_NOT_EXISTS}
        }
        const rawData = getLiteCredentialThumbprintWithoutSig(credential)
        let result = false
        try {
            result = Utils.verifySecp256k1Signature(rawData, credential.proof[Constant.PROOF_SIGNATURE], publicKey);
        } catch (e) {
            return {respbody: false, error: ErrorCode.CREDENTIAL_SIGNATURE_BROKEN}
        }
        if (!result) {
            return {respbody: false, error: ErrorCode.CREDENTIAL_VERIFY_FAIL}
        } else {
            return {respbody: true, error: ErrorCode.SUCCESS}
        }
    }

    const isCredentialArgsValid = function (cptId, issuerWeId, issuerPrivateKey, claim, issuanceDate, expirationDate) {
        if (cptId === null || cptId < 0) {
            return ErrorCode.CPT_ID_ILLEGAL
        }
        if (!isWeIdValid(issuerWeId)) {
            return ErrorCode.CREDENTIAL_ISSUER_INVALID
        }
        if (claim === null) {
            return ErrorCode.CREDENTIAL_CLAIM_NOT_EXISTS
        }
        let errorCode = validDateExpired(issuanceDate, expirationDate)
        if (errorCode.code !== ErrorCode.SUCCESS.code) {
            return errorCode
        }
        if (issuerPrivateKey === null || issuerPrivateKey.length <= 0) {
            return ErrorCode.WEID_PRIVATEKEY_INVALID
        }
        return ErrorCode.SUCCESS
    }

    const isWeIdValid = function (weId) {
        return (weId !== null && weId.length > 0
            && weId.startsWith(Constant.WEID_PREFIX)
            && isMatchTheChainId(weId)
            && isValidAddress(convertWeIdToAddress(weId)))
    }


    const isMatchTheChainId = function (weId) {
        // TODO: Need to check to the chainId in weid is match with the setup or not
        return true
    }

    const isValidAddress = function (address) {
        // TODO: Need to check the address is valid or not
        return true
    }

    const convertWeIdToAddress = function (weId) {
        if (weId === null || weId.length === 0 || weId.includes(Constant.WEID_PREFIX)) {
            return ""
        }
        const weIdFields = weId.split(Constant.WEID_SEPARATOR)
        return weIdFields[weIdFields.length - 1]
    }

    const validDateExpired = function (issuanceDate, expirationDate) {
        if (issuanceDate !== null && issuanceDate <= 0) {
            return ErrorCode.CREDENTIAL_ISSUANCE_DATE_ILLEGAL
        }
        if (expirationDate === null || expirationDate <= 0) {
            return ErrorCode.CREDENTIAL_EXPIRE_DATE_ILLEGAL
        }
        if (expirationDate < new Date().getTime()) {
            // TODO: need to adapt several timestamp formation
            return ErrorCode.CREDENTIAL_EXPIRED
        }
        if (issuanceDate !== null && expirationDate < issuanceDate) {
            return ErrorCode.CREDENTIAL_ISSUANCE_DATE_ILLEGAL
        }
        return ErrorCode.SUCCESS
    }

    const createLiteCredential = function (credentialPojo, privateKey) {
        let rawData = getLiteCredentialThumbprintWithoutSig(credentialPojo)
        let signature = Utils.secp256k1Signature(rawData, privateKey)
        let proof = {}
        // proof[Constant.PROOF_TYPE] = Constant.SECP256K1
        // proof[Constant.PROOF_SIGNATURE] = signature
        // credentialPojo[Constant.PROOF] = proof
        credentialPojo[Constant.PROOF] = signature
        return credentialPojo
    }

    const getLiteCredentialThumbprintWithoutSig = function (credential) {
        let credMap = Object.assign({}, credential);
        delete credMap[Constant.CONTEXT]
        delete credMap[Constant.PROOF]
        credMap[Constant.CLAIM] = getLiteClaimHash(credential)
        credMap[Constant.PROOF_TYPE] = "lite1"
        return stringify(credMap)
    }

    const getLiteClaimHash = function (credential) {
        // deep copy the claim in credential
        return Object.assign({}, credential.claim)
    }

    return CredentialService
}())

const EvidenceService = function (api) {
    this.api = api

    EvidenceService.createEvidence = async function (credential, credentialHash, log, groupId) {
        if (!credentialHash.startsWith("0x")){
            credentialHash = "0x" + credentialHash
        }
        const functionArg = {
            "id": credential.id,
            "hash": "0x"+credentialHash,
            "proof": "xxxx",
            "log": log
        }
        const functionName = "createEvidence"
        const transactionArg = {"groupId": groupId}
        return await this.api.invoke(functionArg, functionName, transactionArg)
    }

    EvidenceService.getEvidence = async function (credentialHash, groupId) {
        if (!credentialHash.startsWith("0x")){
            credentialHash = "0x" + credentialHash
        }
        const functionArg = {"credentialHash": credentialHash}
        const functionName = "getEvidence"
        const transactionArg = {"groupId": groupId}

        return await this.api.invoke(functionArg, functionName, transactionArg)
    }

}


const WI = function (url, fetch_type) {
    this.api = new Api(url, fetch_type)
    this.WeIdService = new WeIdService(this.api)
    this.Utils = Utils
    this.CredentialService = CredentialService
    this.EvidenceService = new EvidenceService(this.api)
}

export default WI