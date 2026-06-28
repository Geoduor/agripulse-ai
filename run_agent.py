from backend.agents.input_parser import parse_farmer_input
from backend.agents.reasoning_agent import analyze_and_advise
from backend.agents.action_executor import execute_action

def run_agripulse(farmer_message: str, location: str, phone: str):
    print(f"\n{'='*50}")
    print(f"🌱 AgriPulse AI Processing...")
    print(f"{'='*50}")
    
    # Step 1: Understand what farmer said
    print("\n📝 Step 1: Parsing farmer input...")
    parsed = parse_farmer_input(farmer_message, location)
    print(f"Understood: {parsed['summary']}")
    
    # Step 2: Analyze and get recommendations
    print("\n🧠 Step 2: Analyzing with weather data...")
    advice = analyze_and_advise(parsed)
    print(f"Diagnosis: {advice['diagnosis']}")
    
    # Step 3: Execute actions
    print("\n⚡ Step 3: Executing actions...")
    farmer_info = {**parsed, "phone": phone}
    result = execute_action(advice, farmer_info)
    
    print(f"\n{'='*50}")
    print("✅ AgriPulse AI Complete!")
    print(f"{'='*50}")
    
    return result

# Run a real test
if __name__ == "__main__":
    run_agripulse(
        farmer_message="My tomatoes have white spots on leaves and are dying",
        location="Nakuru",
        phone="+254700000000"
    )