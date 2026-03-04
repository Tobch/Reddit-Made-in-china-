import requests
import time

BASE_URL = "http://localhost:5000/api"

# Define credentials and specialized topics
multi_user_content = [
    {
        "creds": {"email": "Yaman@gmail.com", "password": "123456789"}, # Existing User
        "posts": [
            {"category": "Robotics", "title": "SLAM is harder than I thought", "content": "Trying to implement GMapping on a custom rover. The LiDAR scan matching keeps drifting when I hit high speeds. Should I switch to RTAB-Map or just tune my EKF better?"},
            {"category": "Engineering", "title": "The beauty of mechanical tolerances", "content": "Just spent the morning with a micrometer. There is something satisfying about a press-fit that works exactly as calculated on paper. 0.02mm makes all the difference."}
        ]
    },
    {
        "creds": {"email": "dan@test.com", "password": "12345678"},
        "posts": [
            {"category": "Physics", "title": "Double-slit experiment with molecules?", "content": "I was reading about the latest research using large molecules like buckyballs. It's insane that wave-particle duality holds up at that scale. Where does the 'classical' world actually start?"},
            {"category": "Mathematics", "title": "Visualizing 4D manifolds", "content": "I've been trying to wrap my head around Calabi-Yau spaces. If string theory is right, these shapes are hidden in every point in space. My brain hurts just trying to code a 3D projection of it."}
        ]
    },
    {
        "creds": {"email": "hero@test.com", "password": "12345678"},
        "posts": [
            {"category": "BioHacking", "title": "Continuous Glucose Monitors (CGM) for non-diabetics", "content": "I've been wearing a Dexcom for a week. It's fascinating to see how a simple bowl of white rice spikes my levels compared to sweet potatoes. Data-driven dieting is the future."},
            {"category": "SpaceX", "title": "Starship IFT-7 Predictions", "content": "The turnaround time between flights is dropping fast. Do we think they'll attempt a full Tower Catch on both stages this time? The orbital mechanics look promising for a summer window."}
        ]
    }
]

def seed_diverse_data():
    comm_res = requests.get(f"{BASE_URL}/communities")
    communities = comm_res.json()

    print("--- Filling Feed with New Topics ---")
    
    for entry in multi_user_content:
        login_res = requests.post(f"{BASE_URL}/auth/login", json=entry['creds'])
        if login_res.status_code != 200:
            print(f"❌ Failed login for {entry['creds']['email']}")
            continue
        
        token = login_res.json().get('token')
        headers = {"Authorization": f"Bearer {token}"}
        print(f"👤 u/{login_res.json().get('user', {}).get('username')} is posting...")

        for post in entry['posts']:
            target = next((c for c in communities if c['name'] == post['category']), None)
            if target:
                res = requests.post(f"{BASE_URL}/posts", json={
                    "communityId": target['_id'],
                    "title": post['title'],
                    "content": post['content']
                }, headers=headers)
                print(f"  ✅ Created: {post['title'][:25]}...")
            time.sleep(0.2)

if __name__ == "__main__":
    seed_diverse_data()