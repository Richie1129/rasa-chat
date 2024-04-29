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
            dispatcher.utter_message(text="沒問題，讓我們來找一個適合你的主題。")
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

        url = "http://ml.hsueh.tw:1288/query/"
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
            # print(response_data['response'])
        else:
            print(f"第一個請求失敗，狀態碼：{response.status_code}")

        # 檢查 responses 是否有內容，如果有則繼續
        if responses:
            # 第二個 API 的 URL 和請求體
            url2 = "http://ml.hsueh.tw/callapi/"
            content = responses[0]  # 取第一個元素作為 content

            data2 = {
            "engine": "taide-llama-3",
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
                "content": "請根據內容，利用150字摘要"
                           "回答只能使用繁體中文"
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
                    # dispatcher.utter_message(text=f"這邊是提出來的名詞解釋:\n{content2}")
                    dispatcher.utter_message(text=content2)
                    dispatcher.utter_message(text="那你還有想要了解什麼嗎？")
                    # dispatcher.utter_message(text=content2)
            else:
                print(f"第二個請求失敗，狀態碼：{response2.status_code}")
        else:
            print("請問需要什麼幫助呢?")

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
                    dispatcher.utter_message(text=f"如果你不知道答案的話，請給我相同的問題，我來替你解答！")
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
            text="首先，讓我們來確定一個研究主題，你對以下哪一個科目感興趣?\n"
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

        # 檢查用戶輸入是否匹配已知學科
        for discipline, topics in disciplines_topics.items():
            if re.fullmatch(discipline, text):
                topics_formatted = '\n'.join([f"{i + 1}. {topic}" for i, topic in enumerate(topics)])
                dispatcher.utter_message(
                    text=f"你對{discipline}這個科目感興趣。請問你想探究{discipline}的哪個主題，選擇下列主題進一步探討：\n{topics_formatted}"
                )
                return [SlotSet("science_discipline", discipline)]

        # 如果沒有匹配到任何學科
        dispatcher.utter_message(text="不好意思，我沒有理解你的意思。你能說得更具體一點嗎？")
        return []

# 化學
class ActionExploreChemistryTopic(Action):
    def name(self):
        return "action_explore_chemistry_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "化學-能量的形式與轉換" :
            dispatcher.utter_message(
                text="你選擇了能量的形式與轉換。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 化學反應中的能量變化\n"
                     "2. 化學反應熱"
            )
            return [SlotSet("subtopic", "chemistry_energy_transformation")]

        if text == "物質的分離與鑑定" :
            dispatcher.utter_message(
                text="你選擇了物質的分離與鑑定，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 物質的分離\n"
                     "2. 物質的鑑定\n"
                )
            return [SlotSet("subtopic", "substance_separation_identification")]

        if text == "物質的結構與功能" :
            dispatcher.utter_message(
                text="你選擇了物質的結構與功能。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 化學式\n"
                     "2. 物質化學式的鑑定\n"
                     "3. 物質的結構\n"
                     "4. 分子模型介紹"
            )
            return [SlotSet("subtopic", "substance_structure_function")]

        if text == "組成地球的物質" :
            dispatcher.utter_message(
                text="你選擇了組成地球的物質。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 自然界中的物質循環\n"
                     "2. 水的性質及影響\n"
                     "3. 水質的淨化、純化與軟化\n"
                     "4. 海水中蘊藏的資源\n"
                     "5. 空氣中所含的物質"
            )
            return [SlotSet("subtopic", "earth_materials")]

        if text == "水溶液中的變化" :
            dispatcher.utter_message(
                text="你選擇了水溶液中的變化。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 水溶液與濃度"
            )
            return [SlotSet("subtopic", "aqueous_solutions")]

        if text == "氧化與還原" :
            dispatcher.utter_message(
                text="你選擇了氧化與還原。請問你對以下哪個主題內容更感興趣。\n"
                "1. 氧化與還原反應的應用\n"
                "2. 氧化與還原反應的機制"
            )
            return [SlotSet("subtopic", "oxidation_reduction_reactions")]

        if text == "酸鹼反應" :
            dispatcher.utter_message(
                text="你選擇了酸鹼反應，請問你對以下哪個主題內容更感興趣\n。"
                "1. 酸鹼反應的速率\n"
                "2. 酸鹼反應的平衡"
            )
            return [SlotSet("subtopic", "acid_base_reactions")]

        if text == "科學在生活中的應用" :
            dispatcher.utter_message(
                text="你選擇了科學在生活中的應用。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 食品與化學\n"
                     "2. 衣料與高分子化學\n"
                     "3. 肥皂與清潔劑\n"
                     "4. 高分子材料與化學：塑膠\n"
                     "5. 陶瓷磚瓦和玻璃\n"
                     "6. 奈米材料、先進材料\n"
                     "7. 藥物與化學"
            )
            return [SlotSet("subtopic", "science_in_life_applications")]
        
        if text == "天然災害與防治-化學" :
            dispatcher.utter_message(
                text="你選擇了天然災害與防治。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 天然災害的影響\n"
                     "2. 化學防治\n"
                     
            )
            return [SlotSet("subtopic", "natural_disasters_and_prevention_chemistry")]

        if text == "環境汙染與防治" :
            dispatcher.utter_message(
                text="你選擇了環境汙染與防治。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 水汙染與防治\n"
                     "2. 大氣汙染與防治"
            )
            return [SlotSet("subtopic", "environmental_pollution_control")]

        if text == "能源的開發與利用" :
            dispatcher.utter_message(
                text="你選擇了能源的開發與利用。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 化石燃料：煤、石油、天然氣\n"
                     "2. 石油分餾及其主要產物\n"
                     "3. 烴的燃燒與汽油辛烷值\n"
                     "4. 化學電池原理\n"
                     "5. 常見的電池\n"
                     "6. 化學電池\n"
                     "7. 替代能源\n"
                     "8. 簡介臺灣的再生能源及附近海域能源的蘊藏與開發"
            )
            return [SlotSet("subtopic", "energy_development_utilization")]

        return []

# 物理
class ActionExplorePhysicsTopic(Action):
    def name(self):
        return "action_explore_physics_topic"
    
    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        print("物理")
        input_message = tracker.latest_message.get('text').strip()
        conversation_rounds = tracker.get_slot('conversation_rounds') or 0
        continue_conversation = tracker.get_slot('continue_conversation') or True

        if not continue_conversation:
            return []

        conversation_rounds += 1
        dispatcher.utter_message(text="哈囉，我是你的物理主題小幫手！")

        if input_message.lower() == "不需要":
            dispatcher.utter_message(text="好的，如果需要其他幫助請隨時告訴我！")
            return self.end_conversation()

        print(f"對話輪數1：{conversation_rounds}")

        url = "http://ml.hsueh.tw/callapi/"
        data = {
            "engine": "gpt-35-turbo",
            "temperature": 0.7,
            "max_tokens": 300,
            "top_p": 0.95,
            "top_k": 5,
            "roles": [{"role": "system", "content": 
                "1. 任務描述：你的關鍵任務是利用以下物理主題幫助學生找到感興趣的研究主題。"
                "你會通過提問和討論這些主題，引導學生探索並深化他們對物理學的興趣和理解。"
                "2. 知識範圍限制：你僅專注於物理學相關的知識。在每次與使用者互動前，你將評估問題是否與物理學相關。"
                "對於非物理相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他物理相關的主題。」"
                "3. 物理學範圍：你的討論和回答將涵蓋以下物理學主題："
                    "物理-能量的形式與轉換、溫度與熱量、力與運動、宇宙與天體、萬有引力、波動、光及聲音、電磁現象、量子現象、物理在生活中的應用"
                "4. 互動範例："
                    "當使用者提出：「我覺得酸鹼中和很有趣。」"
                    "因為與「物理」無關，所以回覆：「這個問題超出了我的專業範圍，但我們可以討論物理中的萬有引力如何影響天體運動。你對此感興趣嗎？」"
                    "回覆不要超過100字"},
                    {"role": "user", "content": input_message}],
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
            print(f"對話輪數2：{conversation_rounds}")
            response.raise_for_status()
            message_content = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
            dispatcher.utter_message(text=message_content)
        except requests.RequestException as error:
            dispatcher.utter_message(text="API請求過程中發生錯誤，請稍後再試。")
            return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

        # API請求成功之後，才增加對話回合數
        conversation_rounds += 1

        if conversation_rounds >= 6:
            dispatcher.utter_message(text="看來我們已經討論了很多！如果你有其他問題，隨時可以問我。")
            return self.end_conversation()

        # 如果未達到3回合，繼續對話
        return [SlotSet("conversation_rounds", conversation_rounds),
                SlotSet("continue_conversation", True)]

    def end_conversation(self):
        return [SlotSet("continue_conversation", False), SlotSet("conversation_rounds", 0)]

# 生物
class ActionExploreBiologyTopic(Action):
    def name(self):
        return "action_explore_biology_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "生殖與遺傳" :
            dispatcher.utter_message(
                text="你選擇了生殖與遺傳。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 遺傳法則\n"
                     "2. 遺傳的分子基礎\n"
                     "3. 突變\n"
                     "4. 探究活動：DNA 的粗萃取"
            )
            return [SlotSet("subtopic", "reproduction_genetics")]

        if text == "演化" :
            dispatcher.utter_message(
                text="你選擇了演化，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 生命的起源\n"
                     "2. 生物的演化"
            )
            return [SlotSet("subtopic", "evolution")]

        if text == "生物多樣性" :
            dispatcher.utter_message(
                text="你選擇了生物多樣性，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 校園生物多樣性的觀察"
            )
            return [SlotSet("subtopic", "biodiversity")]

        if text == "基因改造" :
            dispatcher.utter_message(
                text="你選擇了基因改造，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 基因改造生物\n"
                     "2. 基因改造食品的安全性"
            )
            return [SlotSet("subtopic", "genetic_modification")]
        return []

# 地科
class ActionExploreEarthScienceTopic(Action):
    
    def name(self):
        return "action_explore_earth_science_topic"

    def run(self, dispatcher, tracker, domain):
        text = tracker.latest_message.get('text')

        if text == "天氣與氣候變化" :
            dispatcher.utter_message(
                text="你選擇了天氣與氣候變化。請問你對以下哪個主題內容更感興趣。\n"
                     "1. 大氣的變化\n"
                     "2. 天氣的變化\n"
                     "3. 氣候變化農業的影響"
            )
            return [SlotSet("subtopic", "weather_climate_change")]

        if text == "晝夜與季節" :
            dispatcher.utter_message(
                text="你選擇了晝夜與季節，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 晝夜的影響\n"
                     "2. 季節的變化"
            )
            return [SlotSet("subtopic", "day_night_seasons")]

        if text == "天然災害與防治-地科" :
            dispatcher.utter_message(
                text="你選擇了天然災害與防治，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 颱風\n"
                     "2. 洪水\n"
                     "3. 地震\n"
                     "4. 山崩與土石流"
            )
            return [SlotSet("subtopic", "natural_disasters_prevention_earth_science")]

        if text == "永續發展與資源的利用" :
            dispatcher.utter_message(
                text="你選擇了永續發展與資源的利用，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 人與環境互相依存\n"
                     "2. 永續發展的理念"
            )
            return [SlotSet("subtopic", "sustainable_development_resource_use")]

        if text == "氣候變遷之影響與調適" :
            dispatcher.utter_message(
                text="你選擇了氣候變遷之影響與調適，請問你對以下哪個主題內容更感興趣。\n"
                     "1. 地球歷史的氣候變遷\n"
                     "2. 短期氣候變化\n"
                     "3. 全球暖化"
            )
            return [SlotSet("subtopic", "climate_change_impacts_adaptation")]
        return []   

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

            
class ActionResetSubtopic(Action):
    def name(self):
        return "action_reset_subtopic"

    async def run(self, dispatcher, tracker, domain):
        # 清除subtopic插槽的值
        return [SlotSet("subtopic", None)]
    
# 檢查 slots 狀態
class ActionCheckSlots(Action):
    def name(self):
        return "action_check_slots"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain):
        slots_info = {
            "has_topic": tracker.get_slot('has_topic'),
            "topic": tracker.get_slot('topic'),
            "idea": tracker.get_slot('idea'),
            "science_discipline": tracker.get_slot('science_discipline'),
            "subtopic": tracker.get_slot('subtopic'),
            "continue_conversation": tracker.get_slot('continue_conversation')
        }
        print(slots_info)
        return []
