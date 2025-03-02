# Firebase Security Rules

These rules enforce the actual rules for the planning poker.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {   	
    match /rooms/{roomId} {
    	allow read: if request.auth.uid != null;
      allow write: if resource == null || request.auth.uid == resource.data.uid;
      
      match /members/{memberId} {
    		allow read: if request.auth.uid != null;
     		allow write: if request.auth.uid == memberId || get(/databases/$(database)/documents/rooms/$(roomId)).data.uid == request.auth.uid;
   		}
      
      match /rounds/{roundId} {
      	allow read, write: if request.auth.uid != null;
      }
    }
  }
}
```
