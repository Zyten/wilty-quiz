export default {
  async fetch(request, env, ctx) {
    // Define the CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response('OK', { headers: corsHeaders })
    }

    // Process GET request
    if (request.method === 'GET') {
      return handleGetRequest(request, env, corsHeaders)
    }

    // Return method not allowed for other types of requests
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    })
  }
}

// Function to handle GET request
async function handleGetRequest(request, env, corsHeaders) {
  const sheetId = env.GSHEET_ID
  const apiKey = env.GSHEET_API_KEY
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! ${url}: ${response.status}`)
    }
    const data = await response.json()
    const transformedData = transformSheetDataToQuizData(data)

    return new Response(JSON.stringify(transformedData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response('Error fetching data: ' + error.message, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// Function to transform the sheet data to QuizData format
function transformSheetDataToQuizData(sheetData) {
  const headers = sheetData.values[0]
  const rows = sheetData.values.slice(1)
  return rows.map((row) => {
    let quizItem = {}
    row.forEach((cell, index) => {
      quizItem[headers[index]] = cell
    })
    quizItem.options = quizItem.options.split(',').map((option) => option.trim())
    quizItem.revealTimestamp = parseInt(quizItem.revealTimestamp, 10)
    return quizItem
  })
}
