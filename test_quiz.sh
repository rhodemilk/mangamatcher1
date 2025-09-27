#!/bin/bash

echo "🌸 Testing MangaMatcher Quiz Functionality"
echo "=========================================="
echo ""

# Test 1: Backend health
echo "🔍 Test 1: Backend Health Check"
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Test 2: Quiz options
echo ""
echo "🔍 Test 2: Quiz Options"
OPTIONS_RESPONSE=$(curl -s http://localhost:8000/api/quiz/options)
if echo "$OPTIONS_RESPONSE" | grep -q "genres"; then
    echo "✅ Quiz options are available"
    echo "   Genres: $(echo "$OPTIONS_RESPONSE" | grep -o '"genres":\[[^]]*\]' | wc -c) characters"
else
    echo "❌ Quiz options failed"
    exit 1
fi

# Test 3: Recommendations
echo ""
echo "🔍 Test 3: Quiz Recommendations"
RECOMMENDATIONS_RESPONSE=$(curl -s -X POST http://localhost:8000/api/quiz/recommend \
    -H "Content-Type: application/json" \
    -d '{"genres": ["Action"], "audience": ["Shōnen"], "eras": ["modern"], "vibe": ["Action-Packed"]}')

if echo "$RECOMMENDATIONS_RESPONSE" | grep -q "recommendations"; then
    RECOUNT=$(echo "$RECOMMENDATIONS_RESPONSE" | grep -o '"total_found":[0-9]*' | grep -o '[0-9]*')
    echo "✅ Recommendations working - Found $RECOUNT recommendations"
    echo "   Sample: $(echo "$RECOMMENDATIONS_RESPONSE" | grep -o '"title":"[^"]*"' | head -1)"
else
    echo "❌ Recommendations failed"
    exit 1
fi

# Test 4: Frontend proxy
echo ""
echo "🔍 Test 4: Frontend Proxy"
if curl -s http://localhost:3000/api/quiz/options > /dev/null; then
    echo "✅ Frontend proxy is working"
else
    echo "❌ Frontend proxy failed"
    exit 1
fi

# Test 5: Frontend page
echo ""
echo "🔍 Test 5: Frontend Page"
if curl -s http://localhost:3000 | grep -q "MangaMatcher"; then
    echo "✅ Frontend page is loading"
else
    echo "❌ Frontend page failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your MangaMatcher is working correctly."
echo ""
echo "🌐 Open your browser and go to: http://localhost:3000"
echo "📝 Take the quiz to get manga recommendations!"
echo ""
echo "💡 If you're still not seeing recommendations in the browser:"
echo "   1. Open browser developer tools (F12)"
echo "   2. Check the Console tab for any JavaScript errors"
echo "   3. Check the Network tab to see if API calls are being made"
