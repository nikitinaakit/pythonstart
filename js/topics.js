
import { topics } from "../data/topics.js";

export function getTopicsCatalog() {
    if (!Array.isArray(topics) || topics.length === 0) {
        return [];
    }

    return topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        description: topic.description
    }));
}

export function getTopicById(topicId) {
    return topics.find((item) => item.id === topicId) ?? null;
}
