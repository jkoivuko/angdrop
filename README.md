AngDrop - AngularJS project
===========================
AngDrop is attempt to create service which allow easy peer-to-peer fileshare. Files can be shared only by visiting secret URL and they are not stored server-side at any point of time. Sharing works only if all parties are connected at the same time at the same url.

We are using GoInstant as a "backend" for storing and sharing data temporarily between connected clients. PeerJS is used for WebRTC data-transfer capabilities. 

Installation
------------

```sh
git clone [git-repo-url] angdrop
cd angdrop
npm install

configure your PeerJS and GoInstant account OR use our secret keys which are in this repo(!).

npm start
```

Notes
-----
- To host your own version of this, you need GoInstant (GoAngular) account and PeerJS account. 
- Sharing works currently between Firefox and Chrome (latest versions tested)

Links
-----

- http://goangular.org/
- https://github.com/peers/peerjs

Live Demo
-----

- http://coders.fi:8000/app/#/index

Use incognitio mode to open another client to test peer-to-peer connectivity and file sharing.
You need to establish connections manually by clicking "connect" button after selecting peer you want to connect.
