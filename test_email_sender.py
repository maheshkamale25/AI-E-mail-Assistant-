import requests
import json

def test_email_response_system():
    """Test email sending functionality"""
    base_url = "http://127.0.0.1:8000/api"
    
    print("🔄 Testing Email Response System...")
    
    # First, get available emails to test with
    try:
        response = requests.get(f"{base_url}/emails/")
        emails = response.json()
        
        if emails.get('success') and emails.get('emails'):
            email_list = emails['emails'][:3]  # Get first 3 emails
            print(f"✅ Found {len(email_list)} emails to test with")
            
            # Test single response
            print("\n📧 Testing single email response...")
            single_response = requests.post(
                f"{base_url}/send-single-response/",
                json={"email_id": email_list[0]['id']},
                headers={"Content-Type": "application/json"}
            )
            
            result = single_response.json()
            print(f"Single Response Result: {result}")
            
            # Test bulk responses
            if len(email_list) > 1:
                print("\n📧 Testing bulk email responses...")
                email_ids = [email['id'] for email in email_list]
                
                bulk_response = requests.post(
                    f"{base_url}/send-responses/",
                    json={"email_ids": email_ids},
                    headers={"Content-Type": "application/json"}
                )
                
                bulk_result = bulk_response.json()
                print(f"Bulk Response Result: {bulk_result}")
            
        else:
            print("❌ No emails found. Run process-sample first!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server. Make sure it's running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_email_response_system()
