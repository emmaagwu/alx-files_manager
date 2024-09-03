/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const usersCollection = await dbClient.usersCollection();
      const userExists = await usersCollection.findOne({ email });

      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const insertionResult = await usersCollection.insertOne({ email, password: hashedPassword });
      const userId = insertionResult.insertedId.toString();

      userQueue.add({ userId });
      return res.status(201).json({ email, id: userId });

    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const { email, _id: id } = req.user;

    return res.status(200).json({ email, id: id.toString() });
  }
}
