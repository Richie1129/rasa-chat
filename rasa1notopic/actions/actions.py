# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#

# actions.py
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.interfaces import Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from rasa_sdk.events import FollowupAction
import requests
import re
import random

# 最後3則訊息
def get_last_three_messages(tracker: Tracker):
    # 初始化一個空列表來儲存最後三則消息
    last_three_messages = []

    # 從對話事件中逆向查找所有消息
    for event in reversed(tracker.events):
        if event.get("event") == "user" or event.get("event") == "bot":
            # 如果事件是用戶或機器人發送的消息，則加入到列表中
            last_three_messages.append(event.get("text"))
            # 如果已經找到三則消息，則跳出迴圈
            if len(last_three_messages) == 3:
                break

    # 逆序列表以獲得正確的時間順序（從舊到新）
    last_three_messages.reverse()
    return last_three_messages

# 是/否有研究主題
class ActionHandleTopic(Action):
    def name(self):
        return "action_handle_topic"

    def run(self, dispatcher, tracker, domain):
        has_topic = tracker.get_slot('has_topic')
        print(f"擷取slot 'has_topic': {has_topic}")

        if has_topic == "yes":
            dispatcher.utter_message(text="太好了！請分享一下你想研究的主題，讓我們一起深入探討！")
        elif has_topic == "no":
            dispatcher.utter_message(text="沒關係，讓我們來找一個適合你的主題。")
            return [FollowupAction("action_start_decision_tree")]
        else:
            dispatcher.utter_message(text="我不太清楚你的意思，你可以說得更明確一點嗎？")
        return []
    
# rag/prompt:摘要並解釋
class ActionRagAbstract(Action):
    def name(self):
        return "action_rag_abstract_explain"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("Rag/摘要並名詞解釋")
        input_message = tracker.latest_message.get('text')
        
        # # 獲取最後三則用戶消息
        # last_three_messages = get_last_three_messages(tracker)

        url = "http://ml.hsueh.tw:1288/query/"
        # for input_message in last_three_messages:
        data = {
            "question": input_message
        }
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送請求
        response = requests.post(url, json=data, headers=headers)

        responses = []  # 創建一個空陣列來儲存回應

        if response.status_code == 200:
            response_data = response.json()
            responses.append(response_data['response'])  # 將回應加入到陣列中
            dispatcher.utter_message(text=response_data['response'])
            print(response_data['response'])
        else:
            print(f"第一個請求失敗，狀態碼：{response.status_code}")

        # # 檢查 responses 是否有內容，如果有則繼續
        # if responses:
        #     # 第二個 API 的 URL 和請求體
        #     url2 = "http://ml.hsueh.tw/callapi/"
        #     content = responses[0]  # 取第一個元素作為 content
        #     print(content)

        #     data2 = {
        #     "engine": "taide-llama-3",
        #     "temperature": 0.7,
        #     "max_tokens": 500,
        #     "top_p": 0.95,
        #     "top_k": 5,
        #     "roles": [
        #         {
        #         "role": "system",
        #         "content": content
        #         },{
        #         "role": "user",
        #         "content": "請根據內容，利用150字摘要"
        #                    "回答只能使用繁體中文"
        #         }
        #     ],
        #     "frequency_penalty": 0,
        #     "repetition_penalty": 1.03,
        #     "presence_penalty": 0,
        #     "stop": "",
        #     "past_messages": 10,
        #     "purpose": "dev"
        #     }

        #     # 發送第二個請求
        #     response2 = requests.post(url2, json=data2, headers=headers)

        #     # 檢查回應狀態碼以確認請求成功
        #     if response2.status_code == 200:
        #         chat_response = response2.json()
        #         if 'choices' in chat_response and len(chat_response['choices']) > 0:
        #             content2 = chat_response['choices'][0]['message']['content']
        #             # dispatcher.utter_message(text=f"這邊是提出來的名詞解釋:\n{content2}")
        #             print(content2)
        #             dispatcher.utter_message(text=content2)
        #             dispatcher.utter_message(text="那你還有想要了解什麼嗎？")
        #     else:
        #         print(f"第二個請求失敗，狀態碼：{response2.status_code}")
        # else:
        #     print("請問需要什麼幫助呢?")

        return []
    
# Rag/5W1H
class ActionRagQuestion(Action):
    def name(self):
        return "action_rag_5W1H"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("Rag/5W1H")
        input_message = tracker.latest_message.get('text')

        url = "http://ml.hsueh.tw:1288/query/"
        data = {"question": input_message}
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送請求
        response = requests.post(url, json=data, headers=headers)
        responses = []  # 創建一個空陣列來儲存回應

        if response.status_code == 200:
            response_data = response.json()
            responses.append(response_data['response'])  # 將回應加入到陣列中
            # print(response_data['response'])
        else:
            print(f"第一個請求失敗，狀態碼：{response.status_code}")

        # 檢查 responses 是否有內容，如果有則繼續
        if responses:
            # 第二個 API 的 URL 和請求體
            url2 = "http://ml.hsueh.tw/callapi/"
            content = responses[0]  # 取第一個元素作為 content

            data2 = {
            "engine": "gpt-35-turbo",
            "temperature": 0.7,
            "max_tokens": 500,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [
                {
                "role": "system",
                "content": content
                },{
                "role": "user",
                "content": "你必須使用5W1H框架的問句，給我一個問題，不要包含任何答案。"
                           "回答只能使用繁體中文，回答中不要提供任何答案。"
                }
            ],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
            }

            # 發送第二個請求
            response2 = requests.post(url2, json=data2, headers=headers)

            # 檢查回應狀態碼以確認請求成功
            if response2.status_code == 200:
                chat_response = response2.json()
                if 'choices' in chat_response and len(chat_response['choices']) > 0:
                    content2 = chat_response['choices'][0]['message']['content']
                    dispatcher.utter_message(text=f"首先，你可以先想想這個問題:\n{content2}")
                    # dispatcher.utter_message(text=f"如果你不知道答案的話，請給我相同的問題，我來替你解答！")
            else:
                print(f"第二個請求失敗，狀態碼：{response2.status_code}")
        else:
            print("沒有回應可用於生成 what、how、why 問題。")

        return []

# 決策樹
class ActionStartDecisionTree(Action):
    def name(self):
        return "action_start_decision_tree"

    def run(self, dispatcher, tracker, domain):
        print("決策樹/科目")
        dispatcher.utter_message(
            text="你好呀，首先，讓我們來確定一個研究主題，你對以下哪一個科目感興趣？\n"
            "請輸入：物理、化學、地科或生物。"
            )
        return []

# 科目
class ActionSaveScienceDiscipline(Action):
    def name(self):
        return "action_save_science_discipline"

    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        print("決策樹/科目/主題")
        text = tracker.latest_message.get('text').strip()

        # 學科和對應的主題列表
        disciplines_topics = {
            '化學': [
                "化學-能量的形式與轉換", "物質的分離與鑑定", "物質的結構與功能",
                "組成地球的物質", "水溶液中的變化", "氧化與還原反應", "酸鹼反應",
                "科學在生活中的應用", "天然災害與防治-化學", "環境汙染與防治",
                "能源的開發與利用"
            ],
            '物理': [
                "物理-能量的形式與轉換", "溫度與熱量", "力與運動", "宇宙與天體",
                "萬有引力", "波動、光及聲音", "電磁現象", "量子現象",
                "物理在生活中的應用-科學、技術及社會的互動關係"
            ],
            '生物': [
                "生殖與遺傳", "演化", "生物多樣性", "基因改造"
            ],
            '地科': [
                "天氣與氣候變化", "晝夜與季節", "天然災害與防治-地科",
                "永續發展與資源的利用", "氣候變遷之影響與調適"
            ]
        }
        
        interest_messages = [
            "太好了！你對{}感興趣。這是一個極其精彩的領域。",
            "很棒的選擇！{}是個迷人的科目，我們有很多話題可以探討。",
            "{}是一個非常有趣的領域，讓我們看看有哪些吸引人的主題吧！"
        ]

        matched_discipline = None
        for discipline, topics in disciplines_topics.items():
            if re.search(discipline, text, re.IGNORECASE):
                matched_discipline = discipline
                topics_formatted = '\n'.join([f"{i + 1}. {topic}" for i, topic in enumerate(topics)])
                break

        if matched_discipline:
            selected_message = random.choice(interest_messages).format(matched_discipline)
            dispatcher.utter_message(text=selected_message)
            dispatcher.utter_message(
                text=f"在{matched_discipline}裡面，我們可以探討許多有趣的主題。以下是一些選項，你想深入了解哪一個？\n{topics_formatted}"
            )
            return [FollowupAction("action_clear_slots"), SlotSet("science_discipline", matched_discipline)]

        # 如果沒有匹配到任何學科
        dispatcher.utter_message(text="看起來我們沒有找到對應的科目。能再具體點嗎？或者換個科目試試？")
        return []

        # # 檢查用戶輸入是否匹配已知學科
        # for discipline, topics in disciplines_topics.items():
        #     if re.fullmatch(discipline, text):
        #         topics_formatted = '\n'.join([f"{i + 1}. {topic}" for i, topic in enumerate(topics)])
        #         dispatcher.utter_message(
        #             text=f"你對{discipline}這個科目感興趣。請問你想探究{discipline}的哪個主題，選擇下列主題進一步探討：\n{topics_formatted}"
        #         )
        #         return [FollowupAction("action_clear_slots"),SlotSet("science_discipline", discipline)]

        # # 如果沒有匹配到任何學科
        # dispatcher.utter_message(text="不好意思，我沒有理解你的意思。你能說得更具體一點嗎？")
        # return []

# 定題
class ActionExploreTopic(Action):
    def name(self):
        return "action_explore_topic"
    
    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        print("定題小幫手")
        input_message = tracker.latest_message.get('text').strip()
        conversation_rounds = tracker.get_slot('conversation_rounds') or 0
        continue_conversation = tracker.get_slot('continue_conversation') or True

        if not continue_conversation:
            return []

        if conversation_rounds == 0:
            dispatcher.utter_message(text="哈囉，我是你的定題小幫手！")
            input_message = tracker.latest_message.get('text').strip()
        else:
            # 獲取最後三條用戶的訊息作為上下文
            all_user_messages = [event.get('text') for event in tracker.events if event.get('event') == 'user']
            print(f"對話內容：{all_user_messages}")
            input_message = ' '.join(all_user_messages[-3:])  # 取最後三條訊息並將它們合併為一個字符串

        if input_message.lower() == "不需要":
            dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
            return self.end_conversation()

        url = "http://ml.hsueh.tw:8787/generate-text/"
        data = {
            "prompt": input_message
        }
        headers = {
            'accept': 'application/json', 
            'Content-Type': 'application/json'
            }

        try:
            response = requests.post(url, json=data, headers=headers)
            print(f"對話輪數：{conversation_rounds}")
            response_data = response.json()
            dispatcher.utter_message(text=response_data['response'])
        except requests.RequestException:
            dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
            return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

        conversation_rounds += 1
        if conversation_rounds >= 4:
            return [FollowupAction("action_research_question"), self.end_conversation()]

        return [SlotSet("conversation_rounds", conversation_rounds), SlotSet("continue_conversation", True)]
        
    def end_conversation(self):
        return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]
    
# # 定題
# class ActionExploreTopic(Action):
#     def name(self):
#         return "action_explore_topic"
    
#     def run(self, dispatcher: CollectingDispatcher, tracker, domain):
#         print("定題小幫手")
#         input_message = tracker.latest_message.get('text').strip()
#         conversation_rounds = tracker.get_slot('conversation_rounds') or 0
#         continue_conversation = tracker.get_slot('continue_conversation') or True

#         if not continue_conversation:
#             return []

#         if conversation_rounds == 0:
#             dispatcher.utter_message(text="哈囉，我是你的定題小幫手！")
#             input_message = tracker.latest_message.get('text').strip()
#         else:
#             # 獲取最後三條用戶的訊息作為上下文
#             all_user_messages = [event.get('text') for event in tracker.events if event.get('event') == 'user']
#             print(f"對話內容：{all_user_messages}")
#             input_message = ' '.join(all_user_messages[-3:])  # 取最後三條訊息並將它們合併為一個字符串

#         if input_message.lower() == "不需要":
#             dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
#             return self.end_conversation()

#         url = "http://ml.hsueh.tw/callapi/"
#         data = {
#             "engine": "gpt-35-turbo",
#             "temperature": 0.7,
#             "max_tokens": 300,
#             "top_p": 0.95,
#             "top_k": 5,
#             "roles": [{"role": "system", "content": 
#                 "1.你的關鍵任務是透過「提問」和討論，利用以下自然科學主題幫助學生找到感興趣的研究主題，包括「什麼」、「如何」和「為什麼」的問題。不斷利用問題來引導學生探索並深化他們對自然科學的興趣和理解。"
#                 "2.知識範圍限制： 你專注於自然科學相關的知識。在每次與使用者互動前，你將評估問題是否與「自然科學」相關。對於非自然科學相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他與自然科學相關的主題。」"
#                 "3.自然科學範圍： 你的討論和回答將涵蓋以下主題："
#                 "物理：能量的形式與轉換、溫度與熱量、力與運動、宇宙與天體、萬有引力、波動、光及聲音、電磁現象、量子現象、物理在生活中的應用。"
#                 "化學：能量的形式與轉換、物質的分離與鑑定、物質的結構與功能、組成地球的物質、水溶液中的變化、氧化與還原反應、酸鹼反應、科學在生活中的應用。"
#                 "生物：生殖與遺傳、演化、生物多樣性、基因改造。"
#                 "地科：天氣與氣候變化、晝夜與季節、天然災害與防治、永續發展與資源的利用、氣候變遷之影響與調適。"      
#                 "回覆不要超過100字"},
#                 {"role": "user", "content": input_message}],
#             "frequency_penalty": 0,
#             "repetition_penalty": 1.03,
#             "presence_penalty": 0,
#             "stop": "",
#             "past_messages": 10,
#             "purpose": "dev"
#         }
#         headers = {
#             'Accept': 'application/json',
#             'Content-Type': 'application/json'
#         }

#         try:
#             response = requests.post(url, json=data, headers=headers)
#             print(f"對話輪數：{conversation_rounds}")
#             response.raise_for_status()
#             message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
#             # dispatcher.utter_message(text=message_content)
#         except requests.RequestException as error:
#             dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
#             return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

#         # API請求成功之後，才增加對話回合數
#         conversation_rounds += 1

#         if conversation_rounds >= 4:
#             # dispatcher.utter_message(text="看來我們已經討論了很多！如果你有其他問題，隨時可以問我。")
#             return [FollowupAction("action_research_question"), self.end_conversation()]
        
#         dispatcher.utter_message(text=message_content)

#         # 如果未達到8回合，繼續對話
#         return [SlotSet("conversation_rounds", conversation_rounds),
#                 SlotSet("continue_conversation", True)]
        
#     # 結束對話
#     def end_conversation(self):
#         print("結束對話")
#         return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]
    
# 給研究問題   
class ActionResearchQuestion(Action):
    def name(self) -> Text:
        return "action_research_question"
    
    def get_last_ten_messages(self, tracker: Tracker) -> List[Text]:
        last_ten_messages = []
        for event in reversed(tracker.events):
            if event.get("event") in ["user", "bot"]:
                last_ten_messages.append(event.get("text"))
                if len(last_ten_messages) == 10:
                    break
        last_ten_messages.reverse()
        return last_ten_messages

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        print("研究問題")
        last_ten_messages = self.get_last_ten_messages(tracker)
        input_message = " ".join(last_ten_messages)
        print(input_message)

        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "gpt-35-turbo",
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [
                {"role": "system", "content": "請根據內容，給予高中生一個值得研究的「研究問題」，給予研究問題即可，回覆不要超過100字"},
                {"role": "user", "content": input_message}
            ],
            "frequency_penalty": 0,
            "repetition_penalty": 1.03,
            "presence_penalty": 0,
            "stop": "",
            "past_messages": 10,
            "purpose": "dev"
        }
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
            dispatcher.utter_message("我們已經討論的很多了唷，推薦一個研究問題給你")
            dispatcher.utter_message(text=message_content)
        except requests.RequestException as error:
            dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")

# 科技大觀園
class ActionSaveSubtopic(Action):
    def name(self):
        return "action_save_subtopic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')
        print("科技大觀園")
        # API URL
        api_url = "http://ml.hsueh.tw:1287/query/"
        data = {
            "question": text,
            "search_result": ""
        }
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }

        # 發送 POST 請求到 API
        response = requests.post(api_url, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            if result.get("response") and result["response"] not in ['API請求失敗', 'API請求過程中發生錯誤']:
                # dispatcher.utter_message(text=result["response"])
                dispatcher.utter_message(text="以下來自科技大觀園的相關資訊...")

                search_contents = []
                for content_str in result.get("search_contents", []):
                    if 'Link: ' in content_str and 'Description: ' in content_str:
                        parts = content_str.split(' Link: ')
                        title = parts[0].replace('Title: ', '')
                        link, description = parts[1].split(' Description: ')
                        content_dict = {
                            "title": title,
                            "link": link,
                            "description": description
                        }
                        search_contents.append(content_dict)

                for content in search_contents:
                    message = f"{content['title']}\n{content['description']}\n{content['link']}"
                    dispatcher.utter_message(text=message)
        else:
            dispatcher.utter_message(text="API請求失敗或發生錯誤")
            print('API請求失敗或發生錯誤')

        return []
  
# 檢查 slots 狀態
class ActionCheckSlots(Action):
    def name(self):
        return "action_check_slots"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain):
        print("檢查slots_1")
        slots_info = {
            "has_topic": tracker.get_slot('has_topic'),
            "topic": tracker.get_slot('topic'),
            "science_discipline": tracker.get_slot('science_discipline'),
            "continue_conversation": tracker.get_slot('continue_conversation')
        }
        print(slots_info)
        return []
    
# 清除slot
class ActionClearSlots(Action):
    def name(self) -> Text:
        print("清除slot")
        return "action_clear_slots"

    def run(self, dispatcher: CollectingDispatcher,tracker: Tracker,domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        print("檢查slots_2")
        slots_info = {
            "has_topic": tracker.get_slot('has_topic'),
            "topic": tracker.get_slot('topic'),
            "science_discipline": tracker.get_slot('science_discipline'),
            "continue_conversation": tracker.get_slot('continue_conversation')
        }
        print(slots_info)
        
        # 清除所有的 slots
        return [SlotSet(slot, None) for slot in tracker.slots]
    
# # 化學
# class ActionExploreChemistryTopic(Action):
#     def name(self):
#         return "action_explore_chemistry_topic"
    
#     def run(self, dispatcher: CollectingDispatcher, tracker, domain):
#         print("化學")
#         input_message = tracker.latest_message.get('text').strip()
#         conversation_rounds = tracker.get_slot('conversation_rounds') or 0
#         continue_conversation = tracker.get_slot('continue_conversation') or True

#         if not continue_conversation:
#             return []

#         if conversation_rounds == 0:
#             dispatcher.utter_message(text="哈囉，我是你的化學主題小幫手！")

#         if input_message.lower() == "不需要":
#             dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
#             return self.end_conversation()

#         url = "http://ml.hsueh.tw/callapi/"
#         data = {
#             "engine": "gpt-35-turbo",
#             "temperature": 0.7,
#             "max_tokens": 300,
#             "top_p": 0.95,
#             "top_k": 5,
#             "roles": [{"role": "system", "content": 
#                 "1. 任務描述：你的關鍵任務是利用以下化學主題幫助學生找到感興趣的研究主題。"
#                 "你會通過提問和討論這些主題，引導學生探索並深化他們對化學的興趣和理解。"
#                 "2. 知識範圍限制：你僅專注於化學相關的知識。在每次與使用者互動前，你將評估問題是否與化學相關。"
#                 "對於非化學相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他化學相關的主題。」"
#                 "3. 化學範圍：你的討論和回答將涵蓋以下化學主題："
#                 "能量的形式與轉換、物質的分離與鑑定、物質的結構與功能、組成地球的物質、水溶液中的變化、氧化與還原反應、酸鹼反應、科學在生活中的應用"        
#                 "回覆不要超過100字"},
#                 {"role": "user", "content": input_message}],
#             "frequency_penalty": 0,
#             "repetition_penalty": 1.03,
#             "presence_penalty": 0,
#             "stop": "",
#             "past_messages": 10,
#             "purpose": "dev"
#         }
#         headers = {
#             'Accept': 'application/json',
#             'Content-Type': 'application/json'
#         }

#         try:
#             response = requests.post(url, json=data, headers=headers)
#             print(f"對話輪數：{conversation_rounds}")
#             response.raise_for_status()
#             message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
#             # dispatcher.utter_message(text=message_content)
#         except requests.RequestException as error:
#             dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
#             return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

#         # API請求成功之後，才增加對話回合數
#         conversation_rounds += 1

#         if conversation_rounds >= 8:
#             dispatcher.utter_message(text="看來我們已經討論了很多！如果你有其他問題，隨時可以問我。")
#             return self.end_conversation()
        
#         dispatcher.utter_message(text=message_content)

#         # 如果未達到8回合，繼續對話
#         return [SlotSet("conversation_rounds", conversation_rounds),
#                 SlotSet("continue_conversation", True)]
        
#     # 結束對話
#     def end_conversation(self):
#         return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

# # 物理
# class ActionExplorePhysicsTopic(Action):
#     def name(self):
#         return "action_explore_physics_topic"
    
#     def run(self, dispatcher: CollectingDispatcher, tracker, domain):
#         print("物理")
#         input_message = tracker.latest_message.get('text').strip()
#         conversation_rounds = tracker.get_slot('conversation_rounds') or 0
#         continue_conversation = tracker.get_slot('continue_conversation') or True

#         if not continue_conversation:
#             return [SlotSet("continue_conversation", True), SlotSet("conversation_rounds", 0)]
#             # return []

#         if conversation_rounds == 0:
#             dispatcher.utter_message(text="哈囉，我是你的物理主題小幫手！")

#         if input_message.lower() == "不需要":
#             dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
#             return self.end_conversation()

#         url = "http://ml.hsueh.tw/callapi/"
#         data = {
#             "engine": "gpt-35-turbo",
#             "temperature": 0.7,
#             "max_tokens": 300,
#             "top_p": 0.95,
#             "top_k": 5,
#             "roles": [{"role": "system", "content": 
#                 "1. 任務描述：你的關鍵任務是利用以下物理主題幫助學生找到感興趣的研究主題。"
#                 "你會通過提問和討論這些主題，引導學生探索並深化他們對物理學的興趣和理解。"
#                 "2. 知識範圍限制：你僅專注於物理學相關的知識。在每次與使用者互動前，你將評估問題是否與物理學相關。"
#                 "對於非物理相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他物理相關的主題。」"
#                 "3. 物理學範圍：你的討論和回答將涵蓋以下物理學主題："
#                     "物理-能量的形式與轉換、溫度與熱量、力與運動、宇宙與天體、萬有引力、波動、光及聲音、電磁現象、量子現象、物理在生活中的應用"
#                 "4. 互動範例："
#                     "當使用者提出：「我覺得酸鹼中和很有趣。」"
#                     "因為與「物理」無關，所以回覆：「這個問題超出了我的專業範圍，但我們可以討論物理中的萬有引力如何影響天體運動。你對此感興趣嗎？」"
#                     "回覆不要超過100字"},
#                     {"role": "user", "content": input_message}],
#             "frequency_penalty": 0,
#             "repetition_penalty": 1.03,
#             "presence_penalty": 0,
#             "stop": "",
#             "past_messages": 10,
#             "purpose": "dev"
#         }
#         headers = {
#             'Accept': 'application/json',
#             'Content-Type': 'application/json'
#         }

#         try:
#             response = requests.post(url, json=data, headers=headers)
#             print(f"對話輪數：{conversation_rounds}")
#             response.raise_for_status()
#             message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
#             # dispatcher.utter_message(text=message_content)
#         except requests.RequestException as error:
#             dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
#             return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

#         # API請求成功之後，才增加對話回合數
#         conversation_rounds += 1

#         if conversation_rounds >= 8:
#             dispatcher.utter_message(text="看來我們已經討論了很多！如果你有其他問題，隨時可以問我。")
#             return self.end_conversation()
        
#         dispatcher.utter_message(text=message_content)

#         # 如果未達到8回合，繼續對話
#         return [SlotSet("conversation_rounds", conversation_rounds),
#                 SlotSet("continue_conversation", True)]
        
#         # 結束對話
#     def end_conversation(self):
#         return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

# # 生物
# class ActionExploreBiologyTopic(Action):
#     def name(self):
#         return "action_explore_biology_topic"
    
#     def run(self, dispatcher: CollectingDispatcher, tracker, domain):
#         print("生物")
#         input_message = tracker.latest_message.get('text').strip()
#         conversation_rounds = tracker.get_slot('conversation_rounds') or 0
#         continue_conversation = tracker.get_slot('continue_conversation') or True

#         if not continue_conversation:
#             return []

#         if conversation_rounds == 0:
#             dispatcher.utter_message(text="哈囉，我是你的生物主題小幫手！")

#         if input_message.lower() == "不需要":
#             dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
#             return self.end_conversation()

#         url = "http://ml.hsueh.tw/callapi/"
#         data = {
#             "engine": "gpt-35-turbo",
#             "temperature": 0.7,
#             "max_tokens": 300,
#             "top_p": 0.95,
#             "top_k": 5,
#             "roles": [{"role": "system", "content": 
#                 "1. 任務描述：你的關鍵任務是利用以下生物主題幫助學生找到感興趣的研究主題。"
#                 "你會通過提問和討論這些主題，引導學生探索並深化他們對生物學的興趣和理解。"
#                 "2. 知識範圍限制：你僅專注於生物學相關的知識。在每次與使用者互動前，你將評估問題是否與生物學相關。"
#                 "對於非生物相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他生物相關的主題。」"
#                 "3. 生物學範圍：你的討論和回答將涵蓋以下生物學主題：生殖與遺傳、演化、生物多樣性、基因改造"
#                 "回覆不要超過100字"},
#                     {"role": "user", "content": input_message}],
#             "frequency_penalty": 0,
#             "repetition_penalty": 1.03,
#             "presence_penalty": 0,
#             "stop": "",
#             "past_messages": 10,
#             "purpose": "dev"
#         }
#         headers = {
#             'Accept': 'application/json',
#             'Content-Type': 'application/json'
#         }

#         try:
#             response = requests.post(url, json=data, headers=headers)
#             print(f"對話輪數：{conversation_rounds}")
#             response.raise_for_status()
#             message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
#             # dispatcher.utter_message(text=message_content)
#         except requests.RequestException as error:
#             dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
#             return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

#         # API請求成功之後，才增加對話回合數
#         conversation_rounds += 1

#         if conversation_rounds >= 8:
#             dispatcher.utter_message(text="看來我們已經討論了很多！如果你有其他問題，隨時可以問我。")
#             return self.end_conversation()
        
#         dispatcher.utter_message(text=message_content)

#         # 如果未達到8回合，繼續對話
#         return [SlotSet("conversation_rounds", conversation_rounds),
#                 SlotSet("continue_conversation", True)]
        
#     # 結束對話
#     def end_conversation(self):
#         return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

# # 地科
# class ActionExploreEarthScienceTopic(Action):
    # def name(self):
    #     return "action_explore_earth_science_topic"
    
    # def run(self, dispatcher: CollectingDispatcher, tracker, domain):
    #     print("地科")
    #     input_message = tracker.latest_message.get('text').strip()
    #     conversation_rounds = tracker.get_slot('conversation_rounds') or 0
    #     continue_conversation = tracker.get_slot('continue_conversation') or True

    #     if not continue_conversation:
    #         return []

    #     if conversation_rounds == 0:
    #         dispatcher.utter_message(text="哈囉，我是你的地科主題小幫手！")

    #     if input_message.lower() == "不需要":
    #         dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
    #         return self.end_conversation()

    #     url = "http://ml.hsueh.tw/callapi/"
    #     data = {
    #         "engine": "gpt-35-turbo",
    #         "temperature": 0.7,
    #         "max_tokens": 300,
    #         "top_p": 0.95,
    #         "top_k": 5,
    #         "roles": [{"role": "system", "content": 
    #             "1. 任務描述：你的關鍵任務是利用以下地科主題幫助學生找到感興趣的研究主題。"
    #             "你會通過提問和討論這些主題，引導學生探索並深化他們對地球科學的興趣和理解。"
    #             "2. 知識範圍限制：你僅專注於地球科學相關的知識。在每次與使用者互動前，你將評估問題是否與地球科學相關。"
    #             "對於非地球科學相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他地球科學相關的主題。」"
    #             "3. 地球科學範圍：你的討論和回答將涵蓋以下地球科學主題：天氣與氣候變化、晝夜與季節、天然災害與防治、永續發展與資源的利用、氣候變遷之影響與調適"
    #             "回覆不要超過100字"},
    #                 {"role": "user", "content": input_message}],
    #         "frequency_penalty": 0,
    #         "repetition_penalty": 1.03,
    #         "presence_penalty": 0,
    #         "stop": "",
    #         "past_messages": 10,
    #         "purpose": "dev"
    #     }
    #     headers = {
    #         'Accept': 'application/json',
    #         'Content-Type': 'application/json'
    #     }

    #     try:
    #         response = requests.post(url, json=data, headers=headers)
    #         print(f"對話輪數：{conversation_rounds}")
    #         response.raise_for_status()
    #         message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
    #         # dispatcher.utter_message(text=message_content)
    #     except requests.RequestException as error:
    #         dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
    #         return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

    #     # API請求成功之後，才增加對話回合數
    #     conversation_rounds += 1

    #     if conversation_rounds >= 8:
    #         dispatcher.utter_message(text="看來我們已經討論了很多！如果你有其他問題，隨時可以問我。")
    #         return self.end_conversation()
        
    #     dispatcher.utter_message(text=message_content)

    #     # 如果未達到8回合，繼續對話
    #     return [SlotSet("conversation_rounds", conversation_rounds),
    #             SlotSet("continue_conversation", True)]
        
    # # 結束對話
    # def end_conversation(self):
    #     return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]