import asyncio
import sys
import os

from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor

from .statistic import export_tables_to_excel, get_user_statistics, get_task_statistics

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


API_TOKEN = '7379330461:AAFANy49VXwlHwhmZgt99_emw3YW1VZncIw'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

# Команда для экспорта таблиц
@dp.message_handler(commands=['export_tables'])
async def cmd_export_tables(message: types.Message):
    try:
        await export_tables_to_excel()
        await message.reply("Таблицы успешно экспортированы в XLSX файлы.")
        await bot.send_document(message.chat.id, open('users.xlsx', 'rb'))
        await bot.send_document(message.chat.id, open('tasks.xlsx', 'rb'))
        await bot.send_document(message.chat.id, open('task_statuses.xlsx', 'rb'))
    except Exception as e:
        await message.reply(f"Произошла ошибка при экспорте таблиц: {str(e)}")



# Команда для получения статистики пользователей
@dp.message_handler(commands=['stat'])
async def cmd_user_stats(message: types.Message):
    try:

        stats_user = await get_user_statistics()
        stats_task = await get_task_statistics()

        response = f"*============== СТАТИСТИКА =================*\n"

        response += (
            f"🔸 _Пользователи_"
            f"  Общее количество пользователей: {stats_user['total_users']}\n"
            f"  Присоединилось за последние сутки: {stats_user['recent_users']}\n\n"
        )
        
        response += f"🔸 _Задачи_ \n"
        response += f"  Общее количество задач: {stats_task['total_tasks']}\n"

        for status, count in stats_task['task_statuses'].items():
            response += f"  Количество задач со статусом '{status}': {count}\n"
        
        
        response += f"\n🔸 _Выплаты_ \n"

        response += f"*=======================================*\n"
            
        await message.reply(response)
    except Exception as e:
        await message.reply(f"Произошла ошибка при получении статистики: {str(e)}", parse_mode='Markdown')




if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
