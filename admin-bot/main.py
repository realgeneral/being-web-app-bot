import asyncio
import datetime
import sys
import os

from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor

from .statistic import export_tables_to_excel, get_user_statistics, get_task_statistics, get_wallet_statistics


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
        stats_wallet = await get_wallet_statistics()

        # Получаем текущую дату и время
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        response = f"*============== СТАТИСТИКА =================*\n"
        response += f"`{current_datetime}`\n\n"

        response += (
            f"🔸 _Пользователи_\n"
            f"  Общее количество пользователей: {stats_user['total_users']}\n"
            f"  Присоединилось за последние сутки: {stats_user['recent_users']}\n"
            f"  Премиум пользователей: {stats_user['premium_users']}\n"
            f"  Пользователей с языком 'RU': {stats_user['ru_users']}\n"
            f"  Пользователей с языком 'EN': {stats_user['en_users']}\n"
            f"  Пользователей по реферальной ссылке: {stats_user['referral_users']}\n\n"
        )
        
        response += f"🔸 _Задачи_ \n"
        response += f"  Общее количество задач: {stats_task['total_tasks']}\n"

        for status, count in stats_task['task_statuses'].items():
            response += f"  Количество задач со статусом '{status}': {count}\n"

        response += (
            f"  Задач типа 'Bot': {stats_task['tasks_type1']}\n"
            f"  Задач типа 'Subscribe to Channel': {stats_task['tasks_type2']}\n\n"
        )
        
        
        response += f"🔸 _Пополнения_ \n"
        response += f"  Общее количество транзакций: {stats_wallet['total_transactions']}\n"
        response += f"  Транзакций за последние сутки: {stats_wallet['recent_transactions']}\n"
        response += f"  Количество депозитов: {stats_wallet['deposit_transactions']}\n"
        response += f"  Депозитов за последние сутки: {stats_wallet['recent_deposit_transactions']}\n"
        response += f"  Общая сумма депозитов: {stats_wallet['total_amount_deposited']}\n"
        response += f"  Сумма депозитов за последние сутки: {stats_wallet['recent_total_amount_deposited']}\n"


        response += "  Транзакции по статусам:\n"
        for status, count in stats_wallet['transaction_statuses'].items():
            response += f"    '{status}': {count}\n"

        response += "  Транзакции по статусам за последние сутки:\n"
        for status, count in stats_wallet['recent_transaction_statuses'].items():
            response += f"    '{status}': {count}\n"

        response += f"\n*=======================================*\n"
            
        await message.reply(response, parse_mode='Markdown')
    except Exception as e:
        await message.reply(f"Произошла ошибка при получении статистики: {str(e)}", parse_mode='Markdown')




if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
