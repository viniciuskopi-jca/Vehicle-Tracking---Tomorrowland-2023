from flask import Flask, jsonify, make_response
import pyodbc
from datetime import datetime

app = Flask(__name__)

# Configurações do SQL Server
sql_server_host = 'sqlbi.integra.itg'
sql_server_database = 'bidata'

# Rota para obter os dados em formato JSON
@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        print('Solicitação para /api/data recebida')  # Adicione esta linha para depuração

        # Conectar ao banco de dados SQL Server
        conn = pyodbc.connect('DRIVER={SQL Server};SERVER=' + sql_server_host + ';DATABASE=' + sql_server_database + ';Trusted_Connection=yes')
        cursor = conn.cursor()

        # Consulta SQL
        sql_query = """
        WITH CTE_Telemetria AS (
            SELECT REPLACE([label], '-', '') AS [Placa]
                ,[time_write]
                ,[latitude]
                ,[longitude]
                ,[address] as endereco
                ,CASE
                    WHEN PATINDEX('%[0-9]%', [tracked_unit_label2]) > 0
                    THEN REPLACE(REPLACE(SUBSTRING([tracked_unit_label2], PATINDEX('%[0-9]%', [tracked_unit_label2]), LEN([tracked_unit_label2])), '.', ''), '[^0-9]', '')
                    ELSE ''
                END AS Prefixo
            FROM [BIData].[dbo].[TelemetriaDevStatus]
        )
        SELECT *
        FROM CTE_Telemetria
        WHERE Prefixo IN  (
            '719511', 
            '719614' ,
            '719517', '719544', '18500', '719632', '719556', '719633', '719532', '719626', '719523', '719613', '719553', '719543', '719558', '719630', '719555', '719540', '719527', '719550'
        )
        """

        cursor.execute(sql_query)
        rows = cursor.fetchall()

        # Fechar a conexão com o banco de dados
        conn.close()

        # Preparar os dados para serem enviados em formato JSON
        vehicle_data = []
        for row in rows:
            time_write = datetime.strptime(row.time_write, '%Y-%m-%d %H:%M:%S')
            vehicle_data.append({
                'Prefixo': row.Prefixo,
                'Placa': row.Placa,
                'time_write': time_write.strftime('%Y-%m-%d %H:%M:%S'),
                'latitude': row.latitude,
                'longitude': row.longitude,
                'endereco': row.endereco
            })

        return jsonify(vehicle_data)

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
