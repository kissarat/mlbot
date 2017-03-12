import * as request from 'request';
import * as Consts from './consts';
import SkypeAccount from './skype_account';
import Utils from './utils';
import * as http from 'http';
import {CookieJar} from "request";
import {EventEmitter} from "./utils";

export class ContactsService {
    public contacts: Array<{}>;
    public groups: Array<{}>;
    private requestWithJar: any;
    private eventEmitter: EventEmitter;

    constructor(cookieJar: CookieJar, eventEmitter: EventEmitter) {
        this.requestWithJar = request.defaults({jar: cookieJar});
        this.eventEmitter = eventEmitter;
    }

    public loadContacts(skypeAccount: SkypeAccount, resolve: (skypeAccount: SkypeAccount, contacts: Array<{}>) => {}, reject: any): void {
        // this.requestWithJar.get(Consts.SKYPEWEB_HTTPS + Consts.SKYPEWEB_CONTACTS_HOST + '/contacts/v1/users/' + skypeAccount.selfInfo.username + '/contacts', {
        this.requestWithJar.get(Consts.SKYPEWEB_HTTPS + Consts.SKYPEWEB_CONTACTS_HOST + `/contacts/v2/users/${skypeAccount.selfInfo.username}?delta&reason=default`, {
            headers: {
                'X-Skypetoken': skypeAccount.skypeToken
            }
        }, (error: any, response: http.IncomingMessage, body: any) => {
            if (!error && response.statusCode === 200) {
                const data = JSON.parse(body)
                this.contacts = data.contacts;
                this.groups = data.groups;
                resolve(skypeAccount, this.contacts);
            } else {
                this.eventEmitter.fire('error', 'Failed to load contacts.');
            }
        });
    }
}

export default ContactsService;
