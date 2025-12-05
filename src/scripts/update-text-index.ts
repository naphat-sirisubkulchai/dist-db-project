import mongoose from 'mongoose';
import { Post } from '../models/Post';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scribe';

async function updateTextIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n📋 Checking existing indexes...');
    const indexes = await Post.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));

    // Find and drop all text indexes
    console.log('\n🗑️  Dropping all text indexes...');
    try {
      // Drop all text indexes
      const textIndexes = Object.keys(indexes).filter(name => name.includes('text'));

      if (textIndexes.length === 0) {
        console.log('No text indexes found');
      } else {
        for (const indexName of textIndexes) {
          console.log(`Dropping index: ${indexName}`);
          try {
            await Post.collection.dropIndex(indexName);
            console.log(`✓ Dropped: ${indexName}`);
          } catch (dropErr: any) {
            console.log(`✗ Failed to drop ${indexName}:`, dropErr.message);
          }
        }
        console.log('Text indexes dropped successfully');
      }
    } catch (err: any) {
      if (err.code === 27) {
        console.log('No text index found to drop');
      } else {
        console.log('Error dropping indexes:', err.message);
      }
    }

    // Create new text index with slug
    console.log('\n✨ Creating new text index with slug...');
    await Post.collection.createIndex(
      {
        title: 'text',
        slug: 'text',
        content: 'text',
        excerpt: 'text'
      },
      {
        name: 'post_text_search',
        weights: {
          title: 10,
          slug: 8,
          excerpt: 5,
          content: 1
        }
      }
    );
    console.log('New text index created successfully!');

    // Verify new indexes
    console.log('\n✅ Verifying new indexes...');
    const newIndexes = await Post.collection.getIndexes();
    console.log('Updated indexes:', Object.keys(newIndexes));

    console.log('\n🎉 Text index update completed successfully!');
    console.log('You can now search posts by title, slug, content, and excerpt.');

  } catch (error) {
    console.error('❌ Error updating text index:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

updateTextIndex();
