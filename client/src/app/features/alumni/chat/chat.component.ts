import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  effect,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService, Message, Conversation } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatLoadingComponent } from './chat.loading';

@Component({
  standalone: true,
  selector: 'app-alumni-chat',
  imports: [CommonModule, FormsModule, ChatLoadingComponent],
  template: `
    <div class="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      <!-- Conversations Sidebar -->
      <aside class="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div class="p-4 border-b border-gray-200 bg-white">
          <h2 class="text-xl font-bold text-gray-900">Messages</h2>
        </div>

        <div class="flex-1 overflow-y-auto">
          @for (conv of conversations(); track conv.id) {
            <button
              (click)="selectConversation(conv.id)"
              [class.bg-indigo-50]="selectedConvId() === conv.id"
              [class.border-l-4]="selectedConvId() === conv.id"
              [class.border-indigo-600]="selectedConvId() === conv.id"
              class="w-full p-4 flex items-center space-x-3 hover:bg-gray-100 transition-all border-b border-gray-100 text-left"
            >
              <div
                class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0"
              >
                {{ getOtherParticipant(conv)?.email?.[0]?.toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex justify-between items-baseline">
                  <h3 class="font-bold text-gray-900 truncate">{{ getOtherParticipant(conv)?.email }}</h3>
                </div>
                <p class="text-sm text-gray-500 truncate">
                  {{ conv.messages?.[0]?.content || 'Pas encore de messages' }}
                </p>
              </div>
            </button>
          } @empty {
            <div class="p-8 text-center text-gray-500 italic text-sm">Aucune conversation active.</div>
          }
        </div>
      </aside>

      <!-- Chat Main Area -->
      <main class="flex-1 flex flex-col bg-white">
        @if (selectedConvId()) {
          <!-- Chat Header -->
          <header class="h-16 border-b border-gray-200 flex items-center px-6 bg-white shrink-0">
            <div class="flex items-center space-x-3">
              <div
                class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold"
              >
                {{ activeOtherUser()?.email?.[0]?.toUpperCase() }}
              </div>
              <h3 class="font-bold text-gray-900">{{ activeOtherUser()?.email }}</h3>
            </div>
          </header>

          <!-- Messages List -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            @for (msg of messages(); track msg.id) {
              <div class="flex" [class.justify-end]="isMe(msg.sender_id)">
                <div
                  [class.bg-indigo-600]="isMe(msg.sender_id)"
                  [class.text-white]="isMe(msg.sender_id)"
                  [class.bg-white]="!isMe(msg.sender_id)"
                  [class.text-gray-900]="!isMe(msg.sender_id)"
                  [class.rounded-br-none]="isMe(msg.sender_id)"
                  [class.rounded-bl-none]="!isMe(msg.sender_id)"
                  class="max-w-[70%] p-3 rounded-2xl shadow-sm border border-gray-100 text-sm"
                >
                  <p class="leading-relaxed">{{ msg.content }}</p>
                  <span
                    class="text-[10px] mt-1 block"
                    [class.text-indigo-200]="isMe(msg.sender_id)"
                    [class.text-gray-400]="!isMe(msg.sender_id)"
                  >
                    {{ msg.created_at | date: 'HH:mm' }}
                  </span>
                </div>
              </div>
            }
          </div>

          <!-- Message Input -->
          <footer class="p-4 border-t border-gray-200 bg-white">
            <form (submit)="sendMessage($event)" class="flex items-center space-x-3">
              <input
                type="text"
                [(ngModel)]="newMessageContent"
                name="content"
                placeholder="Écrivez votre message..."
                class="flex-1 px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                type="submit"
                [disabled]="!newMessageContent.trim()"
                class="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </footer>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
            <div class="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Vos conversations</h3>
            <p class="max-w-xs mt-2">
              Sélectionnez une discussion ou contactez un Alumni depuis l'annuaire pour commencer à échanger.
            </p>
          </div>
        }
      </main>
    </div>
  `,
})
export class AlumniChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  selectedConvId = signal<string | null>(null);
  newMessageContent = '';
  isLoading = signal(true);

  constructor() {
    effect(
      () => {
        const convId = this.selectedConvId();
        if (convId) {
          this.loadMessages(convId);
          this.chatService.joinConversation(convId);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.chatService.connect();
    this.loadConversations();

    this.chatService.onNewMessage().subscribe((msg) => {
      if (msg.conversation_id === this.selectedConvId()) {
        this.messages.update((prev) => [...prev, msg]);
      }
      // Update last message in sidebar
      this.conversations.update((convs) => {
        return convs.map((c) => {
          if (c.id === msg.conversation_id) {
            return { ...c, messages: [msg] };
          }
          return c;
        });
      });
    });

    // Check if ID in query params
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.selectedConvId.set(params['id']);
      }
    });
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadConversations() {
    this.chatService.getConversations().subscribe((data) => {
      this.conversations.set(data);
      this.isLoading.set(false);
    });
  }

  loadMessages(convId: string) {
    this.chatService.getMessages(convId).subscribe((data) => {
      this.messages.set(data);
    });
  }

  selectConversation(id: string) {
    this.selectedConvId.set(id);
  }

  sendMessage(event: Event) {
    event.preventDefault();
    if (!this.newMessageContent.trim() || !this.selectedConvId()) return;

    this.chatService.sendMessage(this.selectedConvId()!, this.newMessageContent);
    this.newMessageContent = '';
  }

  getOtherParticipant(conv: Conversation | undefined) {
    return conv?.participants?.[0];
  }

  activeOtherUser() {
    const activeConv = this.conversations().find((c) => c.id === this.selectedConvId());
    return this.getOtherParticipant(activeConv);
  }

  isMe(senderId: string) {
    return senderId === this.authService.currentUser()?.id;
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch {
      // Ignore scroll errors
    }
  }
}
