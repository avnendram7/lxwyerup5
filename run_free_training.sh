#!/bin/bash
# Complete FREE Legal AI Training - Zero Cost
# Run this once and it does everything automatically

echo "🎉 Starting FREE Legal AI Training..."
echo "This will take 5-15 minutes. No costs!"
echo ""

cd /Users/shivkuriyal/Desktop/csshehe/lxwyerup01

# Step 1: Generate Dataset
echo "Step 1/2: Generating 1000 legal prompts..."
python3 scripts/generate_dataset.py --count 1000

if [ $? -ne 0 ]; then
    echo "❌ Dataset generation failed!"
    exit 1
fi

echo "✅ Dataset generated!"
echo ""

# Step 2: Generate FREE training data
echo "Step 2/2: Generating training data with FREE Gemini API..."
echo "This may take 5-15 minutes..."
python3 scripts/train_free.py

if [ $? -ne 0 ]; then
    echo "❌ Training data generation failed!"
    exit 1
fi

echo ""
echo "🎉 SUCCESS! FREE Legal AI training complete!"
echo ""
echo "Your legal AI is ready to use at:"
echo "  - POST /api/chat/legal (authenticated)"
echo "  - POST /api/chat/legal/guest (public)"
echo ""
echo "💰 Total cost: $0.00"
echo "✅ All done!"
