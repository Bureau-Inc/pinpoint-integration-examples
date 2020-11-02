//
//  ViewController.swift
//  SilentAuthCheck
//
//  Created by Kurian Ninan K on 26/09/20.
//  Copyright © 2020 Keyvalue. All rights reserved.
//

import UIKit

class LoginViewController: UIViewController {
    
    @IBOutlet weak var textFieldPhoneNumber: UITextField!
    var correlationId = String()
    var count = 1
    override func viewDidLoad() {
        super.viewDidLoad()
        
    }
    
    @IBAction func buttonLogin(_ sender: Any) {
        
        //correlation ID
        correlationId = UUID().uuidString
        
        //BureauSilentAuth SDK
        let authSDKObj = BureauAuth.Builder()
            .setClientId(clientId: "e72a4414-a416-4872-8eea-6b51d6cd96e1")
            .setMode(mode: .sandbox)
            .setTimeout(timeoutinSeconds: 60)
            .build()
        
        guard let phoneNumberValue = self.textFieldPhoneNumber.text else {
            self.showAlert(message: "Enter mobile Number")
            return}
        // Call this API in background thread, otherwise it will freeze the UI
        DispatchQueue.global(qos: .userInitiated).async {
                let response = authSDKObj.makeAuthCall(mobile: "91\(phoneNumberValue)", correlationId: self.correlationId)
                print(response)
                self.callUserInfoAPI()
        }
        
    }
    
    //User info API
    func callUserInfoAPI(){
        let queryItems = [URLQueryItem(name: "correlationId", value: correlationId)]
        var urlComps = URLComponents(string: "https://api.sandbox.bureau.id/v2/auth/userinfo")!
        urlComps.queryItems = queryItems
        let finalUrl = urlComps.url!.absoluteString
        var request = URLRequest(url: URL(string: finalUrl)!)
        request.timeoutInterval = 1
        request.httpMethod = "GET"
        request.setValue("ZTcyYTQ0MTQtYTQxNi00ODcyLThlZWEtNmI1MWQ2Y2Q5NmUxOmYxODRjZDc4NjQyZDM2YmIzMzI3YWU5YTE2NDg4YTM0NWVkMTI3MGYxODU4MGQ5MjUwNWY4ZDMyMGQ1MWRkYTIK", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let session = URLSession.shared
        let task = session.dataTask(with: request, completionHandler: { data, response, error -> Void in
            if error == nil{
                do {
                    let json = try JSONSerialization.jsonObject(with: data!) as! Dictionary<String, AnyObject>
                    if let mobileNumberValue = json["mobileNumber"] as? String{
                        DispatchQueue.main.async {
                            let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
                            let newViewController = storyBoard.instantiateViewController(withIdentifier: "success") as! SuccessViewController
                            newViewController.mobileNumber = mobileNumberValue
                            newViewController.modalPresentationStyle = .fullScreen
                            self.present(newViewController, animated: false, completion: nil)
                        }
                    }else{
                        if let codePresent = json["code"] as? Int{
                            //if code == 202100, make the api call again
                            if codePresent == 202100{
                                if self.count <= 10{
                                    self.count += 1
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: {
                                        self.callUserInfoAPI()
                                    })
                                }else{
                                    return
                                }
                            }else{
                                return
                            }
                        }else{
                            return
                        }
                    }
                } catch {
                    print("error")
                }
            }
        })
        task.resume()
    }
    
    func showAlert(message: String){
        let alert = UIAlertController(title:  NSLocalizedString("alert", comment: ""), message: message, preferredStyle: UIAlertController.Style.alert)
        alert.addAction(UIAlertAction(title:  NSLocalizedString("ok", comment: ""), style: UIAlertAction.Style.default, handler: nil))
        alert.popoverPresentationController?.sourceView = self.view
        self.present(alert, animated: true, completion: nil)
    }
}
