import asyncio
import requests
import time
from pywizlight import discovery, wizlight, PilotBuilder

# AWS Server URL
WEB_SERVER_URL = "https://moodmanager.me/api/check_mailbox"

async def connection_test():
    while True:
        bulbs = await discovery.discover_lights(broadcast_space='255.255.255.255')

        if not bulbs:
            print("No bulbs found")
            time.sleep(2)
        
        target_bulb = bulbs[0]  # 첫 번째 전구 선택
        return target_bulb

async def execute_light_command(data, bulb):
    """
    JSON 데이터로 조명을 제어
    """
    


async def main_loop(bulb):
    print("Waiting for AWS server command...")

    while True:
        try:
            response = requests.get(WEB_SERVER_URL, timeout=2)

            if response.status_code == 200:
                result = response.json()

                if result.get("has_command"):
                    command_data = result.get("command_data")
                    await execute_light_command(command_data, bulb)
                else:
                    pass
        except requests.RequestException as e:
            print(f"Error connecting to server: {e}")

        await asyncio.sleep(0.5)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    bulb = connection_test()
    loop.run_until_complete(main_loop(bulb))

